"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { previewProducts } from "@/lib/preview-catalog";
import { addToCartSchema, updateCartItemSchema, mergeGuestCartSchema } from "@/lib/validations/cart";
import { getCartItemLimit } from "@/lib/validations/variants";

export interface CartProductData {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  images: string[];
}

export interface GuestCartLine {
  productId: string;
  quantity: number;
  variant?: string;
}

export interface VerifiedCartItem extends GuestCartLine {
  id: string;
  variant: string;
  product: CartProductData;
}

const cartProductSelect = {
  id: true, name: true, slug: true, price: true, stock: true, images: true,
  isActive: true, qikinkVariants: true,
} as const;

function verifyLine(line: Required<GuestCartLine>, product: CartProductData & { qikinkVariants?: unknown }, id: string) {
  const stock = getCartItemLimit(product, line.variant);
  if (!stock) return null;

  return {
    ...line, id, quantity: Math.min(line.quantity, stock),
    product: { id: product.id, name: product.name, slug: product.slug, price: product.price, images: product.images, stock },
  };
}

export async function getDatabaseCart(): Promise<{ success: boolean; items: VerifiedCartItem[]; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, items: [], error: "Unauthorized" };
    const rows = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: { product: { select: cartProductSelect } },
      orderBy: { createdAt: "desc" },
    });

    const items: VerifiedCartItem[] = [];
    for (const { id, productId, quantity, variant, product, updatedAt } of rows) {
      const item = product.isActive ? verifyLine({ productId, quantity, variant }, product, id) : null;
      if (item) items.push(item);
      else await prisma.cartItem.deleteMany({ where: { id, updatedAt } });
    }
    return { success: true, items };
  } catch {
    return { success: false, items: [], error: "Failed to load bag." };
  }
}

export async function addToDatabaseCart(productId: string, quantity: number, variant = "") {
  const parsed = addToCartSchema.safeParse({ productId, quantity, variant });
  if (!parsed.success) return { success: false, error: "Invalid item or quantity." };
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    const userId = session.user.id;
    const product = await prisma.product.findUnique({
      where: { id: productId, isActive: true },
      select: { stock: true, qikinkVariants: true },
    });
    const limit = product ? getCartItemLimit(product, variant) : 0;
    if (!limit) return { success: false, error: "This option is unavailable." };

    await prisma.$transaction(async (tx) => {
      const row = await tx.cartItem.upsert({
        where: { userId_productId_variant: { userId, productId, variant } },
        create: { userId, productId, variant, quantity: Math.min(quantity, limit) },
        update: { quantity: { increment: quantity } },
      });
      if (row.quantity > limit) {
        await tx.cartItem.update({ where: { id: row.id }, data: { quantity: limit } });
      }
    });
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update bag." };
  }
}

export async function updateDatabaseCartQuantity(productId: string, quantity: number, variant = "") {
  const parsed = updateCartItemSchema.safeParse({ productId, quantity, variant });
  if (!parsed.success) return { success: false, error: "Invalid quantity." };
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    const where = { userId: session.user.id, productId, variant };
    if (!quantity) {
      await prisma.cartItem.deleteMany({ where });
      return { success: true };
    }

    const product = await prisma.product.findUnique({
      where: { id: productId, isActive: true },
      select: { stock: true, qikinkVariants: true },
    });
    const limit = product ? getCartItemLimit(product, variant) : 0;
    if (!limit) return { success: false, error: "This option is unavailable." };
    await prisma.cartItem.updateMany({ where, data: { quantity: Math.min(quantity, limit) } });
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update bag." };
  }
}

export async function mergeGuestCartAction(rawGuestItems: GuestCartLine[]) {
  const parsed = mergeGuestCartSchema.safeParse(rawGuestItems);
  if (!parsed.success) return getDatabaseCart();
  const session = await auth();
  if (!session?.user?.id) return { success: false, items: [], error: "Unauthorized" };

  const unmerged: GuestCartLine[] = [];
  for (const item of parsed.data) {
    const result = await addToDatabaseCart(item.productId, item.quantity, item.variant);
    if (!result.success && result.error !== "This option is unavailable.") unmerged.push(item);
  }
  return { ...await getDatabaseCart(), unmerged };
}

export async function getVerifiedGuestCartItems(rawGuestItems: GuestCartLine[]): Promise<VerifiedCartItem[]> {
  const parsed = mergeGuestCartSchema.safeParse(rawGuestItems);
  if (!parsed.success || !parsed.data.length) return [];

  try {
    const products = process.env.DATABASE_URL
      ? await prisma.product.findMany({
          where: { id: { in: parsed.data.map((item) => item.productId) }, isActive: true },
          select: cartProductSelect,
        })
      : previewProducts;

    const byId = new Map(products.map((product) => [product.id, product]));
    return parsed.data.flatMap((line) => {
      const product = byId.get(line.productId);
      const item = product && verifyLine(line, product, JSON.stringify([line.productId, line.variant]));
      return item ? [item] : [];
    });
  } catch {
    return [];
  }
}
