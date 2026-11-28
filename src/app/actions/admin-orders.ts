"use server";

import { getAvailableVariants } from "@/lib/validations/variants";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth-checks";
import { OrderStatus, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { sendOrderShippedForOrder } from "@/lib/email";
import { refreshQikinkOrder, submitQikinkOrder } from "@/lib/qikink/fulfillment";

export async function manageQikinkOrder(orderId: string, action: "send" | "refresh", providerId?: string) {
  await requireAdminSession();
  try {
    if (action === "send") {
      await submitQikinkOrder(orderId, true);
      const order = await prisma.order.findUnique({
        where: { id: orderId }, select: { fulfillmentStatus: true, fulfillmentError: true },
      });
      if (order?.fulfillmentStatus !== "SUBMITTED") {
        return { success: false, message: order?.fulfillmentError || "This order is not ready to send." };
      }
    } else if (action === "refresh") {
      const result = await refreshQikinkOrder(orderId, providerId?.trim());
      if (result.shipped) await sendOrderShippedForOrder(orderId).catch(() => {});
    } else {
      return { success: false, message: "Invalid fulfillment action." };
    }
    return { success: true, message: action === "send" ? "Order sent to Qikink." : "Qikink status updated." };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return { success: false, message: "The provider order could not be saved. Check that it is not already linked." };
    }
    return { success: false, message: error instanceof Error ? error.message : "Qikink could not be reached." };
  } finally {
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath(`/orders/${orderId}`);
    revalidatePath("/admin/orders");
  }
}

/**
 * Lists orders for admin with status filtering and pagination.
 */
export async function getAdminOrders(params?: {
  status?: string;
  page?: number;
  limit?: number;
}) {
  await requireAdminSession();

  const status = params?.status?.toUpperCase();
  const page = Math.max(1, params?.page || 1);
  const limit = Math.max(1, Math.min(50, params?.limit || 10));
  const skip = (page - 1) * limit;

  const where: Prisma.OrderWhereInput = {};
  if (status && status !== "ALL" && Object.values(OrderStatus).includes(status as OrderStatus)) {
    where.status = status as OrderStatus;
  }

  const [orders, counts] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, total: true, createdAt: true, status: true, paymentId: true, razorpayOrderId: true,
        user: { select: { name: true, email: true } },
        orderItems: { select: { id: true, quantity: true, priceAtPurchase: true, variant: true, product: { select: { name: true } } } },
      },
    }),
    prisma.order.groupBy({ by: ["status"], _count: true }),
  ]);
  const totalCount = counts.reduce((sum, item) => sum + (!where.status || where.status === item.status ? item._count : 0), 0);

  return {
    orders,
    counts,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
}

/**
 * Fetches complete details of a specific order for admin inspection.
 */
export async function getAdminOrderById(orderId: string) {
  await requireAdminSession();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      orderItems: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: true,
            },
          },
        },
      },
    },
  });

  return order;
}

/**
 * Validates and executes order status transitions.
 * Permitted transitions:
 *  - PAID -> SHIPPED -> DELIVERED
 *  - PAID -> CANCELLED (Restores product stock in atomic transaction)
 *  - PENDING -> CANCELLED
 */
export async function updateOrderStatus(orderId: string, nextStatus: OrderStatus) {
  await requireAdminSession();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { orderItems: true },
  });

  if (!order) {
    return { success: false, error: "Order not found." };
  }

  if (order.qikinkNumber) {
    return { success: false, error: "Manage fulfillment and cancellations for this order in Qikink." };
  }

  const current = order.status;

  // Validate allowed state transitions
  const isValidTransition =
    (current === OrderStatus.PAID && nextStatus === OrderStatus.SHIPPED) ||
    (current === OrderStatus.SHIPPED && nextStatus === OrderStatus.DELIVERED) ||
    (current === OrderStatus.PAID && nextStatus === OrderStatus.CANCELLED) ||
    (current === OrderStatus.PENDING && nextStatus === OrderStatus.CANCELLED);

  if (!isValidTransition) {
    return {
      success: false,
      error: `Invalid transition from ${current} to ${nextStatus}. Allowed progressions: PAID → SHIPPED → DELIVERED, or (PAID/PENDING) → CANCELLED.`,
    };
  }

  try {
    let refundNotice: string | null = null;

    if (current === OrderStatus.PAID && nextStatus === OrderStatus.CANCELLED) {
      // Atomic stock restoration for previously paid order
      await prisma.$transaction(async (tx) => {
        for (const item of order.orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { increment: item.quantity },
            },
          });
        }

        await tx.order.update({
          where: { id: orderId },
          data: { status: OrderStatus.CANCELLED },
        });
      });

      refundNotice =
        "Product inventory has been restored to catalog. NOTE: Any customer payment refund must be issued manually via the Razorpay Dashboard.";
    } else {
      // Normal state advance (e.g. SHIPPED, DELIVERED, or cancelling unpaid PENDING)
      await prisma.order.update({
        where: { id: orderId },
        data: { status: nextStatus },
      });

      // Trigger shipping confirmation transactional email
      if (nextStatus === OrderStatus.SHIPPED) {
        sendOrderShippedForOrder(orderId).catch((err) =>
          console.error("Non-blocking shipped email trigger error:", err)
        );
      }
    }

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin");
    revalidatePath("/account/orders");

    return {
      success: true,
      message: refundNotice || `Order status updated to ${nextStatus}.`,
      notice: refundNotice,
    };
  } catch (error) {
    console.error("Failed to update order status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Database error updating order status.",
    };
  }
}

/**
 * Aggregates dashboard analytics: total orders, total revenue, pending shipments, low stock drops.
 */
export async function getAdminDashboardMetrics() {
  await requireAdminSession();

  const [totals, recentOrders, inventory] = await Promise.all([
    prisma.order.groupBy({ by: ["status"], _count: true, _sum: { total: true } }),
    prisma.order.findMany({
      take: 5, orderBy: { createdAt: "desc" },
      select: { id: true, total: true, status: true, user: { select: { name: true, email: true } } },
    }),
    prisma.product.findMany({
      where: { isActive: true }, orderBy: { updatedAt: "desc" },
      select: { id: true, name: true, price: true, qikinkVariants: true },
    }),
  ]);
  const unavailable = inventory.filter(product => !getAvailableVariants(product.qikinkVariants).length);
  return {
    totalOrders: totals.reduce((sum, group) => sum + group._count, 0),
    totalRevenue: totals.filter(group => group.status === "PAID" || group.status === "SHIPPED" || group.status === "DELIVERED")
      .reduce((sum, group) => sum + (group._sum.total ?? 0), 0),
    pendingShipments: totals.find(group => group.status === "PAID")?._count ?? 0,
    unavailableCount: unavailable.length,
    recentOrders,
    unavailableProducts: unavailable.slice(0, 5).map(({ id, name, price }) => ({ id, name, price })),
  };
}
