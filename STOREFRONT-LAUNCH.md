# RORECLUB storefront handoff

## Review the frontend

Run `npm ci`, then `npm run dev`. Open `/`, follow a category into `/shop/`, and choose a garment. Use sample customer details at `/checkout/`.

- [x] ESLint, TypeScript and the optimized Next.js export completed. Local destinations and asset references in the exported HTML resolved.
- [x] Inspected the desktop campaign and the collection at a 320px frame width. The shop and checkout fit the narrow viewport without horizontal scrolling.
- [x] Tested a category deep link, an empty filter combination, reset, and ascending price sorting. Retested a rapid reset followed by sort.
- [x] Tested a missing size, a second colour, the fabric detail view, the image lightbox, the size guide, and Escape dismissal.
- [x] Verified bag quantities, removal, persistence after navigation and a fresh page load, and empty bag and checkout recovery.
- [x] Completed contact, delivery and review with sample values. Two ₹899 tees plus ₹60 preview delivery produced ₹1,858. Completion left the preview bag available.
- [x] Verified the newsletter preview acknowledgement. Without a configured endpoint, the form keeps the email on the device.

## Before taking live orders

- [ ] Replace the four sample garments in `src/lib/catalog.ts` with a mapping from your Prisma products and Qikink variants. Keep one stable identifier per product, colour and size combination. Use authoritative availability and pricing.
- [ ] Replace the marked campaign image in `src/components/home/Home.tsx` and each colourway’s front and detail images in `src/lib/catalog.ts`. The preview detail image uses a crop of the front view. Confirm copy, image rights and garment measurements in `src/components/product/SizeGuide.tsx`.
- [ ] Connect the checkout UI to your order and payment flow. Recompute prices and delivery charges server-side, validate stock and serviceability, and send successful orders to Qikink once. Confirm your supported countries, delivery rate, tax treatment and returns policy. The preview assumes Indian addresses and a flat ₹60 delivery charge.
- [ ] Set `NEXT_PUBLIC_NEWSLETTER_ENDPOINT` at build time to enable signup. It receives a JSON POST with an email field and must return a successful HTTP status only after accepting a subscription. Configure consent, unsubscribe and service-side validation with your email provider.
- [ ] Test real device Safari and Android Chrome, screen-reader navigation, reduced motion, and production performance with final photography and the live catalogue. Place and reconcile a sandbox order through your payment and fulfilment services before enabling purchases.
