# RORE CLUB

A Next.js storefront for anime-inspired streetwear and fandom merch. Razorpay captures prepaid INR orders, and Qikink prints and ships products saved in its **My Products** catalog. The storefront ships to Indian addresses.

## Local preview

Install dependencies with `npm ci`, then run `npm run dev` and open [the local storefront](http://localhost:3000). On Windows PowerShell, use `npm.cmd` if script execution is disabled. Without `DATABASE_URL`, the catalog and guest bag use sample products and purchases are disabled. Set `AUTH_SECRET` for Auth.js. In PowerShell, you can set it for the preview session with:

```powershell
$env:AUTH_SECRET = node -e "process.stdout.write(require('node:crypto').randomBytes(32).toString('base64url'))"
npm.cmd run dev
```

## Connect your catalog and checkout

1. Keep the migration owner's `DATABASE_URL` in the ignored `.env.migrations.local`. From a shell with no existing `DATABASE_URL`, run `node --env-file=.env.migrations.local node_modules/prisma/build/index.js migrate deploy`. For a new database, create a dedicated login named `rore_store_app` with a generated password and apply `prisma/runtime-access.sql` once as the owner. In the storefront's `.env`, use the dedicated login for `DATABASE_URL` and set `AUTH_SECRET` and `NEXT_PUBLIC_APP_URL`. Use the Supabase session pooler or a direct PostgreSQL connection. Run `npx prisma generate`.
2. To provision an administrator, set `ADMIN_EMAIL` and `ADMIN_PASSWORD` for the maintenance session and run `node --env-file=.env.migrations.local --import tsx prisma/create-admin.ts`. The storefront login can register customers. If deploying behind a trusted reverse proxy, set `AUTH_CLIENT_IP_HEADER` to a single-IP header the proxy always overwrites and restrict origin access to that proxy. Without this setting, authentication uses a shared source limit alongside its per-email limit.
3. In [Qikink](https://dashboard.qikink.com/), create products with your print artwork and copy each **My Products** SKU. In **Admin → Products**, add your photos and retail price, then enter each option as `Black / M | YOUR-QIKINK-SKU` in **Qikink product options**. Use one row per size/color combination. For an accessory with one option, enter `One size | YOUR-QIKINK-SKU`. The store uses these mappings and retains its own product names, prices, and images. Unmapped products cannot be purchased.
4. In **Qikink → Integration → Custom API**, use the sandbox Client ID and Client Secret as `QIKINK_CLIENT_ID` and `QIKINK_CLIENT_SECRET`, with `QIKINK_MODE=sandbox`. Use the SKUs available in that environment. [Qikink Custom API reference](https://documenter.getpostman.com/view/26157218/2sBYAysUHS)
5. Set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET`. Configure automatic capture and a Razorpay webhook for `payment.captured` or `order.paid` at `https://<your-domain>/api/webhooks/razorpay`. Test Razorpay keys pair with Qikink sandbox. [Razorpay payment checklist](https://razorpay.com/security/checklist/)
6. Complete a sandbox order and confirm the purchased variants, address, and order reference in Qikink. When your live accounts, production SKUs, and Qikink wallet are ready, set `QIKINK_MODE=live` and deploy the corresponding live credentials. Check that the first live order moves into production in your Qikink dashboard. [Qikink prepaid fulfillment](https://qikink.com/help/payments-pricing/payments-and-order-fulfillment/)

In **Admin → Products → Import Qikink designs**, download the CSV template and add one row per variant from **My Products**. Repeat the design ID, title and retail price on each row. Use the actual Store SKU for fulfillment and the optional Product SKU for stock reports. Imported designs are drafts. Re-importing a design skips it and preserves your edits.

Open a draft to add its description and photos, set its regular price and optional sale price, and enable storefront visibility. The sale price applies to the bag and checkout. Clear it to restore the regular price. The first photo is the cover. Uploads accept JPEG, PNG, WebP and AVIF up to 4 MB. On Netlify, photos use site-wide Blobs storage when Cloudinary is unconfigured. Resend is optional for order emails.

## Product availability

In Admin → Products, open Qikink No Stock Report and paste the complete SKU column from the current dashboard report. It matches the blank Product SKU across designs. Add that code as the optional third field in each product option, for example `Black / M | STORE-SKU | BLANK-SKU`. The Store SKU sends the purchased design to fulfillment. Applying the report updates the size and colour choices in the catalog, bag, and checkout. Repeat when the report changes.

## Fulfillment operations

Each captured payment stores a fulfillment record with the purchased SKU, quantity, and address. The checkout callback and signed webhook use the same idempotent payment handler. One order submission is claimed at a time, and the Qikink reference identifies the same purchase across retries.

Open **Admin → Orders → [order]** to retry a rejected submission after fixing the cause or refresh an accepted order to show its shipping status and tracking link. For a timed-out or interrupted submission, search by the store reference in Qikink and link the existing order ID. If no order exists and Qikink confirms it, arrange fulfillment in the dashboard with the same reference and link the resulting ID. Cancel fulfillment in the Qikink dashboard and handle refunds in Razorpay.

## Storefront imagery

Built-in ImageGen created the After Hours campaign photo, four apparel and accessory mockups, and the Arcade Night tee mockup. The briefs were a charcoal manga-print tee against a crimson moon, studio flat lays of the ghost tee, mecha hoodie, oni tee and distressed cap, and a retro arcade spaceship tee with a lime pixel sun. Optimized images are in `public/images/after-hours.webp` and `public/images/products/*.webp`.
