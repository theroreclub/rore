import { z } from "zod";

export const addressSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(60, "Name is too long"),
  phone: z
    .string()
    .trim()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number is too long")
    .regex(/^[0-9+\-\s()]+$/, "Please enter a valid phone number"),
  street: z
    .string()
    .trim()
    .min(3, "Street address must be at least 3 characters")
    .max(120, "Street address is too long"),
  city: z
    .string()
    .trim()
    .min(2, "City is required")
    .max(60, "City name is too long"),
  state: z
    .string()
    .trim()
    .min(2, "State / Province is required")
    .max(60, "State name is too long"),
  postalCode: z
    .string()
    .trim()
    .min(4, "Postal code must be at least 4 characters")
    .max(10, "Postal code is too long"),
  country: z
    .string()
    .trim()
    .min(2, "Country is required")
    .default("IN"),
  isDefault: z.boolean().default(false),
});

export type AddressInput = z.infer<typeof addressSchema>;
