/*
  Warnings:

  - You are about to drop the column `delivery_date` on the `delivery_notes` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `delivery_notes` table. All the data in the column will be lost.
  - Made the column `rate` on table `delivery_note_details` required. This step will fail if there are existing NULL values in that column.
  - Made the column `line_total` on table `delivery_note_details` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `delivery_note_date` to the `delivery_notes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "delivery_note_details" ADD COLUMN     "discount_amount" DECIMAL(18,3) DEFAULT 0.000;

-- Fix potential NULLs in delivery_note_details
UPDATE "delivery_note_details" SET "rate" = 0 WHERE "rate" IS NULL;
UPDATE "delivery_note_details" SET "line_total" = 0 WHERE "line_total" IS NULL;

ALTER TABLE "delivery_note_details" ALTER COLUMN "rate" SET NOT NULL,
ALTER COLUMN "line_total" SET NOT NULL;

-- AlterTable for delivery_notes (Safe migration)
-- 1. Add columns as nullable first
ALTER TABLE "delivery_notes" ADD COLUMN "delivery_note_date" DATE;
ALTER TABLE "delivery_notes" ADD COLUMN "customer_notes" TEXT;

-- 2. Synchronize data from old columns
UPDATE "delivery_notes" SET "delivery_note_date" = "delivery_date";
UPDATE "delivery_notes" SET "customer_notes" = "notes";

-- 3. Set a fallback for delivery_note_date if any records were NULL
UPDATE "delivery_notes" SET "delivery_note_date" = CURRENT_DATE WHERE "delivery_note_date" IS NULL;

-- 4. Apply the rest of the changes and constraints
ALTER TABLE "delivery_notes" 
DROP COLUMN "delivery_date",
DROP COLUMN "notes",
ADD COLUMN     "attachments" JSONB,
ADD COLUMN     "discount_amount" DECIMAL(18,3) DEFAULT 0.000,
ADD COLUMN     "discount_level" VARCHAR(50) DEFAULT 'Line Item Level',
ADD COLUMN     "discount_type" VARCHAR(20) DEFAULT 'Fixed',
ADD COLUMN     "invoice_status" VARCHAR(50) DEFAULT 'Not Invoiced',
ADD COLUMN     "reference_number" VARCHAR(255),
ADD COLUMN     "total_discount" DECIMAL(18,3) DEFAULT 0.000,
ALTER COLUMN "delivery_note_number" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "delivery_note_date" SET NOT NULL;

