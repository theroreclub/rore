BEGIN;
ALTER TABLE "Product" ADD COLUMN "regularPrice" INTEGER,
    ADD COLUMN "qikinkProductId" TEXT,
    ADD CONSTRAINT "Product_sale_price_check" CHECK ("regularPrice" IS NULL OR ("price" > 0 AND "regularPrice" > "price"));
UPDATE "Product" SET "qikinkProductId" = substring("slug" from 8)
WHERE "slug" ~ '^qikink-[0-9]+$' AND jsonb_array_length("qikinkVariants") > 0;
CREATE UNIQUE INDEX "Product_qikinkProductId_key" ON "Product"("qikinkProductId");
COMMIT;
