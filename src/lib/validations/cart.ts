import { z } from "zod";

const cartLine = {
  productId: z.string().min(1).max(100),
  variant: z.string().max(80).default(""),
};
const quantity = z.number().int().max(20);

export const addToCartSchema = z.object({ ...cartLine, quantity: quantity.positive() });
export const updateCartItemSchema = z.object({ ...cartLine, quantity: quantity.min(0) });
export const mergeGuestCartSchema = z.array(addToCartSchema).max(100);
