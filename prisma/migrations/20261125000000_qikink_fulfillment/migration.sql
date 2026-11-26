CREATE TYPE "FulfillmentStatus" AS ENUM ('QUEUED', 'SUBMITTING', 'SUBMITTED', 'FAILED', 'REVIEW');

ALTER TABLE "Product" ADD COLUMN "qikinkVariants" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "CartItem" ADD COLUMN "variant" TEXT NOT NULL DEFAULT '';
DROP INDEX "CartItem_userId_productId_key";
CREATE UNIQUE INDEX "CartItem_userId_productId_variant_key" ON "CartItem"("userId", "productId", "variant");

ALTER TABLE "Order" ADD COLUMN "qikinkEnvironment" TEXT,
    ADD COLUMN "qikinkNumber" TEXT,
    ADD COLUMN "qikinkOrderId" TEXT,
    ADD COLUMN "fulfillmentStatus" "FulfillmentStatus",
    ADD COLUMN "fulfillmentError" TEXT,
    ADD COLUMN "fulfillmentAttemptedAt" TIMESTAMP(3),
    ADD COLUMN "qikinkStatus" TEXT,
    ADD COLUMN "trackingUrl" TEXT;
CREATE UNIQUE INDEX "Order_qikinkNumber_key" ON "Order"("qikinkNumber");
CREATE UNIQUE INDEX "Order_qikinkEnvironment_qikinkOrderId_key" ON "Order"("qikinkEnvironment", "qikinkOrderId");

ALTER TABLE "OrderItem" ADD COLUMN "variant" TEXT NOT NULL DEFAULT '',
    ADD COLUMN "qikinkSku" TEXT,
    ADD COLUMN "cartItemId" TEXT;
