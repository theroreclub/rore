"use server";

import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth-checks";
import { adminCategorySchema, AdminCategoryInput } from "@/lib/validations/admin-category";
import { revalidatePath } from "next/cache";

/**
 * Returns categories with their product count.
 */
export async function getAdminCategories() {
  await requireAdminSession();

  return prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });
}

/**
 * Creates a new category.
 */
export async function createCategory(input: AdminCategoryInput) {
  await requireAdminSession();

  const parsed = adminCategorySchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid category details.",
    };
  }

  const { name, slug, description } = parsed.data;

  const existingSlug = await prisma.category.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (existingSlug) {
    return {
      success: false,
      error: `A category with slug "${slug}" already exists.`,
    };
  }

  try {
    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: description || null,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/");

    return { success: true, category };
  } catch (error) {
    console.error("Failed to create category:", error);
    return { success: false, error: "Database error while creating category." };
  }
}

/**
 * Updates an existing category (renames, changes slug, or description).
 */
export async function updateCategory(id: string, input: AdminCategoryInput) {
  await requireAdminSession();

  const parsed = adminCategorySchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid category details.",
    };
  }

  const { name, slug, description } = parsed.data;

  const existingSlug = await prisma.category.findFirst({
    where: {
      slug,
      NOT: { id },
    },
    select: { id: true },
  });

  if (existingSlug) {
    return {
      success: false,
      error: `A category with slug "${slug}" already exists.`,
    };
  }

  try {
    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        description: description || null,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/");

    return { success: true, category };
  } catch (error) {
    console.error("Failed to update category:", error);
    return { success: false, error: "Database error while updating category." };
  }
}

/**
 * Deletes a category if and only if it has zero products.
 * Prevents accidental cascading loss of products.
 */
export async function deleteCategory(id: string) {
  await requireAdminSession();

  try {
    const productCount = await prisma.product.count({
      where: { categoryId: id },
    });

    if (productCount > 0) {
      return {
        success: false,
        error: `Cannot delete category: it currently contains ${productCount} product(s). Please reassign or delete the products first.`,
      };
    }

    await prisma.category.delete({
      where: { id },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/");

    return { success: true, message: "Category deleted successfully." };
  } catch (error) {
    console.error("Failed to delete category:", error);
    return { success: false, error: "Failed to delete category." };
  }
}
