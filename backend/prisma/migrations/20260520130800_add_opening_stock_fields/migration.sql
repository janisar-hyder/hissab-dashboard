-- AlterTable
ALTER TABLE "inventory_items" ADD COLUMN     "brands" VARCHAR(255),
ADD COLUMN     "opening_stock" DECIMAL(18,3) DEFAULT 0,
ADD COLUMN     "opening_stock_value" DECIMAL(18,3) DEFAULT 0.000;

-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "attachments" JSONB;

-- AlterTable
ALTER TABLE "receipts" ADD COLUMN     "attachments" JSONB;

-- AlterTable
ALTER TABLE "credit_notes" ADD COLUMN     "attachments" JSONB;
