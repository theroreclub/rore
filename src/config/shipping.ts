/**
 * Single source of truth for shipping rules & calculations.
 * All amounts stored as integers in smallest currency unit (paise for INR).
 */
export const SHIPPING_CONFIG = {
  // Orders equal to or exceeding ₹1,999 get free shipping
  FREE_SHIPPING_THRESHOLD: 199900, // ₹1,999.00
  // Flat-rate shipping fee for orders below the threshold
  STANDARD_SHIPPING_FEE: 9900,     // ₹99.00
};

/**
 * Calculates shipping fee in paise based on order subtotal.
 */
export function calculateShippingFee(subtotalInPaise: number): number {
  if (subtotalInPaise <= 0) return 0;
  if (subtotalInPaise >= SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD) {
    return 0;
  }
  return SHIPPING_CONFIG.STANDARD_SHIPPING_FEE;
}
