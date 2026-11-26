"use server";

import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth-checks";
import { adminProductSchema, AdminProductInput } from "@/lib/validations/admin-product";
import { rupeesToPaise } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { getVariants } from "@/lib/validations/variants";

/**
 * Lists products for the admin panel with search, category filter, and pagination.
 */
export async function getAdminProducts(params?: {
  search?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
}) {
  await requireAdminSession();

  const search = params?.search?.trim();
  const categoryId = params?.categoryId;
  const page = Math.max(1, params?.page || 1);
  const limit = Math.max(1, Math.min(50, params?.limit || 10));
  const skip = (page - 1) * limit;

  const where: Prisma.ProductWhereInput = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
    ];
  }

  if (categoryId && categoryId !== "ALL") {
    where.categoryId = categoryId;
  }

  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
}

/**
 * Creates a new product.
 */
export async function createProduct(input: AdminProductInput) {
  await requireAdminSession();

  const parsed = adminProductSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid product details.",
    };
  }

  const { name, slug, description, priceInRupees, stock, categoryId, isActive, images, qikinkVariants } =
    parsed.data;

  // Check unique slug
  const existingSlug = await prisma.product.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (existingSlug) {
    return {
      success: false,
      error: `A product with slug "${slug}" already exists. Please choose a different slug.`,
    };
  }

  try {
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: rupeesToPaise(priceInRupees),
        stock,
        categoryId,
        isActive,
        images,
        qikinkVariants,
      },
    });

    revalidatePath("/products");
    revalidatePath("/admin/products");

    return { success: true, product };
  } catch (error) {
    console.error("Failed to create product:", error);
    return { success: false, error: "Database error while creating product." };
  }
}

/**
 * Updates an existing product.
 */
export async function updateProduct(id: string, input: AdminProductInput) {
  await requireAdminSession();

  const parsed = adminProductSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid product details.",
    };
  }

  const { name, slug, description, priceInRupees, stock, categoryId, isActive, images, qikinkVariants } =
    parsed.data;

  // Check unique slug excluding current product
  const existingSlug = await prisma.product.findFirst({
    where: {
      slug,
      NOT: { id },
    },
    select: { id: true },
  });

  if (existingSlug) {
    return {
      success: false,
      error: `A product with slug "${slug}" already exists.`,
    };
  }

  try {
    const current = await prisma.product.findUniqueOrThrow({ where: { id }, select: { updatedAt: true, qikinkVariants: true } });
    const previous = new Map(getVariants(current.qikinkVariants).map(option => [option.sku, option]));
    const product = await prisma.product.update({
      where: { id, updatedAt: current.updatedAt },
      data: {
        name,
        slug,
        description,
        price: rupeesToPaise(priceInRupees),
        stock,
        categoryId,
        isActive,
        images,
        qikinkVariants: qikinkVariants.map(({ label, sku, blankSku }) => ({
          label, sku, blankSku, unavailable: previous.get(sku)?.unavailable ?? false, environment: previous.get(sku)?.environment,
        })),
      },
    });

    revalidatePath("/products");
    revalidatePath(`/products/${slug}`);
    revalidatePath("/admin/products");

    return { success: true, product };
  } catch (error) {
    console.error("Failed to update product:", error);
    return { success: false, error: "Database error while updating product." };
  }
}

/**
 * Deletes a product safely.
 * If the product appears in any OrderItem, it is soft-deleted (isActive: false) to preserve order history.
 * If never ordered, it is permanently deleted.
 */
export async function deleteProduct(id: string) {
  await requireAdminSession();

  try {
    // Check if product is referenced in customer order history
    const orderItemsCount = await prisma.orderItem.count({
      where: { productId: id },
    });

    if (orderItemsCount > 0) {
      // Soft-delete to preserve immutable receipts
      await prisma.product.update({
        where: { id },
        data: { isActive: false },
      });

      revalidatePath("/products");
      revalidatePath("/admin/products");

      return {
        success: true,
        softDeleted: true,
        message:
          "Product has been ordered in customer receipts. It was deactivated (soft-deleted) so past order history remains intact.",
      };
    }

    // Permanently remove unused product
    await prisma.product.delete({
      where: { id },
    });

    revalidatePath("/products");
    revalidatePath("/admin/products");

    return {
      success: true,
      softDeleted: false,
      message: "Product permanently removed from catalog.",
    };
  } catch (error) {
    console.error("Failed to delete product:", error);
    return { success: false, error: "Failed to delete product." };
  }
}

/**
 * Toggles product active visibility status.
 */
export async function toggleProductActive(id: string, currentStatus: boolean) {
  await requireAdminSession();

  try {
    await prisma.product.update({
      where: { id },
      data: { isActive: !currentStatus },
    });

    revalidatePath("/products");
    revalidatePath("/admin/products");

    return { success: true };
  } catch (error) {
    console.error("Failed to toggle product status:", error);
    return { success: false, error: "Failed to toggle status." };
  }
}
