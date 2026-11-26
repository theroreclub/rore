-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "confirmationEmailSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "shippedEmailSent" BOOLEAN NOT NULL DEFAULT false;
