import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility to combine Tailwind CSS classes safely without collisions
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats an integer price (stored in the smallest currency unit, like paise or cents)
 * into a localized currency string.
 *
 * Example:
 * 149900 paise -> "₹1,499.00"
 */
export function formatPrice(
  amountInSmallestUnit: number,
  currency: string = "INR",
  locale: string = "en-IN"
): string {
  // Guard against invalid inputs
  const safeAmount = Number.isFinite(amountInSmallestUnit) ? amountInSmallestUnit : 0;
  const majorUnits = safeAmount / 100;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(majorUnits);
}

/**
 * Converts entered Rupees to integer paise.
 * Example: 2499 -> 249900
 */
export function rupeesToPaise(rupees: number | string): number {
  const num = typeof rupees === "string" ? parseFloat(rupees) : rupees;
  if (!Number.isFinite(num) || num < 0) return 0;
  return Math.round(num * 100);
}

/**
 * Converts stored integer paise to Rupees for input display.
 * Example: 249900 -> 2499
 */
export function paiseToRupees(paise: number): number {
  if (!Number.isFinite(paise) || paise < 0) return 0;
  return paise / 100;
}
