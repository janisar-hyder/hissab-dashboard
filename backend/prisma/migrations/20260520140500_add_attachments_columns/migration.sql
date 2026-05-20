-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "attachments" JSONB;

-- AlterTable
ALTER TABLE "receipts" ADD COLUMN     "attachments" JSONB;

-- AlterTable
ALTER TABLE "credit_notes" ADD COLUMN     "attachments" JSONB;
