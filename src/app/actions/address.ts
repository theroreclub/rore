"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { addressSchema, AddressInput } from "@/lib/validations/address";
import { revalidatePath } from "next/cache";

export interface AddressResult {
  success: boolean;
  error?: string;
  address?: {
    id: string;
    fullName: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string | null;
    isDefault: boolean;
  };
}

/**
 * Fetches all saved delivery addresses for the currently logged-in user.
 */
export async function getUserAddresses() {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  return prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
}

/**
 * Creates a new delivery address for the logged-in user.
 */
export async function createAddress(data: AddressInput): Promise<AddressResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized. Please sign in." };
    }

    const parsed = addressSchema.safeParse(data);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message || "Invalid address data";
      return { success: false, error: msg };
    }

    const userId = session.user.id;
    const existingCount = await prisma.address.count({ where: { userId } });
    const shouldBeDefault = parsed.data.isDefault || existingCount === 0;

    // Use a transaction if this address will be default
    const newAddress = await prisma.$transaction(async (tx) => {
      if (shouldBeDefault && existingCount > 0) {
        await tx.address.updateMany({
          where: { userId },
          data: { isDefault: false },
        });
      }

      return tx.address.create({
        data: {
          userId,
          fullName: parsed.data.fullName,
          phone: parsed.data.phone,
          street: parsed.data.street,
          city: parsed.data.city,
          state: parsed.data.state,
          postalCode: parsed.data.postalCode,
          country: parsed.data.country,
          isDefault: shouldBeDefault,
        },
      });
    });

    revalidatePath("/account");
    revalidatePath("/checkout");

    return { success: true, address: newAddress };
  } catch (error) {
    console.error("Failed to create address:", error);
    return { success: false, error: "Failed to save address. Please try again." };
  }
}

/**
 * Updates an existing delivery address, enforcing ownership.
 */
export async function updateAddress(
  id: string,
  data: AddressInput
): Promise<AddressResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized." };
    }

    const parsed = addressSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Invalid data" };
    }

    const userId = session.user.id;

    // Verify ownership
    const existing = await prisma.address.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return { success: false, error: "Address not found." };
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (parsed.data.isDefault && !existing.isDefault) {
        await tx.address.updateMany({
          where: { userId },
          data: { isDefault: false },
        });
      }

      return tx.address.update({
        where: { id },
        data: {
          fullName: parsed.data.fullName,
          phone: parsed.data.phone,
          street: parsed.data.street,
          city: parsed.data.city,
          state: parsed.data.state,
          postalCode: parsed.data.postalCode,
          country: parsed.data.country,
          isDefault: parsed.data.isDefault,
        },
      });
    });

    revalidatePath("/account");
    revalidatePath("/checkout");

    return { success: true, address: updated };
  } catch (error) {
    console.error("Failed to update address:", error);
    return { success: false, error: "Failed to update address." };
  }
}

/**
 * Deletes an address, enforcing ownership.
 */
export async function deleteAddress(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized." };
    }

    const userId = session.user.id;
    const existing = await prisma.address.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return { success: false, error: "Address not found." };
    }

    await prisma.$transaction(async (tx) => {
      await tx.address.delete({ where: { id } });

      // If deleted was default, make the most recent remaining one default
      if (existing.isDefault) {
        const remaining = await tx.address.findFirst({
          where: { userId },
          orderBy: { createdAt: "desc" },
        });
        if (remaining) {
          await tx.address.update({
            where: { id: remaining.id },
            data: { isDefault: true },
          });
        }
      }
    });

    revalidatePath("/account");
    revalidatePath("/checkout");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete address:", error);
    return { success: false, error: "Failed to delete address." };
  }
}

/**
 * Sets an address as default for the user.
 */
export async function setDefaultAddress(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized." };
    }

    const userId = session.user.id;
    const existing = await prisma.address.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return { success: false, error: "Address not found." };
    }

    await prisma.$transaction(async (tx) => {
      await tx.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });

      await tx.address.update({
        where: { id },
        data: { isDefault: true },
      });
    });

    revalidatePath("/account");
    revalidatePath("/checkout");

    return { success: true };
  } catch (error) {
    console.error("Failed to set default address:", error);
    return { success: false, error: "Failed to update default address." };
  }
}
