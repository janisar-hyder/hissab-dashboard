/*
  Warnings:

  - You are about to drop the column `billing_address` on the `company_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `billing_attention` on the `company_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `billing_city` on the `company_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `billing_country` on the `company_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `shipment_address` on the `company_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `shipment_attention` on the `company_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `shipment_city` on the `company_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `shipment_country` on the `company_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `billing_address` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the column `billing_attention` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the column `billing_city` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the column `billing_country` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the column `mobile` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the column `shipment_address` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the column `shipment_attention` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the column `shipment_city` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the column `shipment_country` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the column `vat_preference` on the `inventory_items` table. All the data in the column will be lost.
  - You are about to drop the column `mobile` on the `purchase_vendor_contacts` table. All the data in the column will be lost.
  - You are about to drop the column `billing_address` on the `purchase_vendors` table. All the data in the column will be lost.
  - You are about to drop the column `billing_attention` on the `purchase_vendors` table. All the data in the column will be lost.
  - You are about to drop the column `billing_city` on the `purchase_vendors` table. All the data in the column will be lost.
  - You are about to drop the column `billing_country` on the `purchase_vendors` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `purchase_vendors` table. All the data in the column will be lost.
  - You are about to drop the column `mobile` on the `purchase_vendors` table. All the data in the column will be lost.
  - You are about to drop the column `shipment_address` on the `purchase_vendors` table. All the data in the column will be lost.
  - You are about to drop the column `shipment_attention` on the `purchase_vendors` table. All the data in the column will be lost.
  - You are about to drop the column `shipment_city` on the `purchase_vendors` table. All the data in the column will be lost.
  - You are about to drop the column `shipment_country` on the `purchase_vendors` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "company_profiles" DROP COLUMN "billing_address",
DROP COLUMN "billing_attention",
DROP COLUMN "billing_city",
DROP COLUMN "billing_country",
DROP COLUMN "shipment_address",
DROP COLUMN "shipment_attention",
DROP COLUMN "shipment_city",
DROP COLUMN "shipment_country",
ADD COLUMN     "account_manager_email" VARCHAR(255),
ADD COLUMN     "account_manager_name" VARCHAR(255),
ADD COLUMN     "account_manager_phone" VARCHAR(50),
ADD COLUMN     "billing_address_attention" VARCHAR(255),
ADD COLUMN     "billing_address_city" VARCHAR(100),
ADD COLUMN     "billing_address_country" VARCHAR(100),
ADD COLUMN     "billing_address_details" TEXT,
ADD COLUMN     "shipment_address_attention" VARCHAR(255),
ADD COLUMN     "shipment_address_city" VARCHAR(100),
ADD COLUMN     "shipment_address_country" VARCHAR(100),
ADD COLUMN     "shipment_address_details" TEXT;

-- AlterTable
ALTER TABLE "customers" DROP COLUMN "billing_address",
DROP COLUMN "billing_attention",
DROP COLUMN "billing_city",
DROP COLUMN "billing_country",
DROP COLUMN "deleted_at",
DROP COLUMN "mobile",
DROP COLUMN "shipment_address",
DROP COLUMN "shipment_attention",
DROP COLUMN "shipment_city",
DROP COLUMN "shipment_country",
ADD COLUMN     "billing_address_attention" VARCHAR(255),
ADD COLUMN     "billing_address_city" VARCHAR(100),
ADD COLUMN     "billing_address_country" VARCHAR(100),
ADD COLUMN     "billing_address_details" TEXT,
ADD COLUMN     "deleted_by" INTEGER,
ADD COLUMN     "deleted_date" TIMESTAMP(3),
ADD COLUMN     "shipment_address_attention" VARCHAR(255),
ADD COLUMN     "shipment_address_city" VARCHAR(100),
ADD COLUMN     "shipment_address_country" VARCHAR(100),
ADD COLUMN     "shipment_address_details" TEXT;

-- AlterTable
ALTER TABLE "inventory_items" DROP COLUMN "vat_preference",
ADD COLUMN     "deleted_by" INTEGER,
ADD COLUMN     "deleted_date" TIMESTAMP(3),
ADD COLUMN     "vat_rate_id" INTEGER;

-- AlterTable
ALTER TABLE "purchase_vendor_contacts" DROP COLUMN "mobile";

-- AlterTable
ALTER TABLE "purchase_vendors" DROP COLUMN "billing_address",
DROP COLUMN "billing_attention",
DROP COLUMN "billing_city",
DROP COLUMN "billing_country",
DROP COLUMN "deleted_at",
DROP COLUMN "mobile",
DROP COLUMN "shipment_address",
DROP COLUMN "shipment_attention",
DROP COLUMN "shipment_city",
DROP COLUMN "shipment_country",
ADD COLUMN     "billing_address_attention" VARCHAR(255),
ADD COLUMN     "billing_address_city" VARCHAR(100),
ADD COLUMN     "billing_address_country" VARCHAR(100),
ADD COLUMN     "billing_address_details" TEXT,
ADD COLUMN     "deleted_by" INTEGER,
ADD COLUMN     "deleted_date" TIMESTAMP(3),
ADD COLUMN     "shipment_address_attention" VARCHAR(255),
ADD COLUMN     "shipment_address_city" VARCHAR(100),
ADD COLUMN     "shipment_address_country" VARCHAR(100),
ADD COLUMN     "shipment_address_details" TEXT;

-- CreateTable
CREATE TABLE "quotations" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "quotation_number" VARCHAR(100) NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "quotation_date" DATE NOT NULL,
    "expiry_date" DATE,
    "reference_number" VARCHAR(255),
    "sales_person_id" INTEGER,
    "currency_id" INTEGER NOT NULL,
    "status" VARCHAR(50) DEFAULT 'Draft',
    "discount_level" VARCHAR(50) DEFAULT 'Line Item Level',
    "discount_amount" DECIMAL(18,3) DEFAULT 0.000,
    "discount_type" VARCHAR(20) DEFAULT 'Fixed',
    "sub_total" DECIMAL(18,3) DEFAULT 0.000,
    "total_discount" DECIMAL(18,3) DEFAULT 0.000,
    "total_vat" DECIMAL(18,3) DEFAULT 0.000,
    "grand_total" DECIMAL(18,3) DEFAULT 0.000,
    "customer_notes" TEXT,
    "terms_and_conditions" TEXT,
    "attachments" JSONB,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "updated_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" INTEGER,
    "deleted_date" TIMESTAMP(3),
    "deleted_by" INTEGER,

    CONSTRAINT "quotations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotation_details" (
    "id" SERIAL NOT NULL,
    "quotation_id" INTEGER NOT NULL,
    "item_id" INTEGER NOT NULL,
    "description" TEXT,
    "quantity" DECIMAL(18,3) NOT NULL,
    "rate" DECIMAL(18,3) NOT NULL,
    "discount_amount" DECIMAL(18,3) DEFAULT 0.000,
    "vat_rate_id" INTEGER,
    "line_total" DECIMAL(18,3) NOT NULL,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "updated_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" INTEGER,
    "deleted_date" TIMESTAMP(3),
    "deleted_by" INTEGER,

    CONSTRAINT "quotation_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "invoice_number" VARCHAR(100) NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "quotation_id" INTEGER,
    "invoice_date" DATE NOT NULL,
    "due_date" DATE,
    "payment_terms" VARCHAR(100),
    "reference_number" VARCHAR(255),
    "sales_person_id" INTEGER,
    "currency_id" INTEGER NOT NULL,
    "sales_partner_id" INTEGER,
    "commission_percentage" DECIMAL(5,2) DEFAULT 0.00,
    "commission_amount" DECIMAL(18,3) DEFAULT 0.000,
    "status" VARCHAR(50) DEFAULT 'Draft',
    "discount_level" VARCHAR(50) DEFAULT 'Line Item Level',
    "discount_amount" DECIMAL(18,3) DEFAULT 0.000,
    "discount_type" VARCHAR(20) DEFAULT 'Fixed',
    "sub_total" DECIMAL(18,3) DEFAULT 0.000,
    "total_discount" DECIMAL(18,3) DEFAULT 0.000,
    "total_vat" DECIMAL(18,3) DEFAULT 0.000,
    "grand_total" DECIMAL(18,3) DEFAULT 0.000,
    "balance_due" DECIMAL(18,3) DEFAULT 0.000,
    "customer_notes" TEXT,
    "terms_and_conditions" TEXT,
    "attachments" JSONB,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "updated_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" INTEGER,
    "deleted_date" TIMESTAMP(3),
    "deleted_by" INTEGER,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_details" (
    "id" SERIAL NOT NULL,
    "invoice_id" INTEGER NOT NULL,
    "item_id" INTEGER NOT NULL,
    "description" TEXT,
    "quantity" DECIMAL(18,3) NOT NULL,
    "rate" DECIMAL(18,3) NOT NULL,
    "discount_amount" DECIMAL(18,3) DEFAULT 0.000,
    "vat_rate_id" INTEGER,
    "line_total" DECIMAL(18,3) NOT NULL,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "updated_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" INTEGER,
    "deleted_date" TIMESTAMP(3),
    "deleted_by" INTEGER,

    CONSTRAINT "invoice_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recurring_invoices" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "profile_name" VARCHAR(255) NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "repeat_every" VARCHAR(50) NOT NULL DEFAULT 'Month',
    "starts_on" DATE NOT NULL,
    "ends_on" DATE,
    "never_expires" BOOLEAN DEFAULT false,
    "last_invoice_date" DATE,
    "next_invoice_date" DATE,
    "payment_terms" VARCHAR(100),
    "accounts_receivable_id" INTEGER,
    "status" VARCHAR(50) DEFAULT 'Draft',
    "discount_level" VARCHAR(50) DEFAULT 'Line Item Level',
    "discount_amount" DECIMAL(18,3) DEFAULT 0.000,
    "discount_type" VARCHAR(20) DEFAULT 'Fixed',
    "sub_total" DECIMAL(18,3) DEFAULT 0.000,
    "total_discount" DECIMAL(18,3) DEFAULT 0.000,
    "total_vat" DECIMAL(18,3) DEFAULT 0.000,
    "grand_total" DECIMAL(18,3) DEFAULT 0.000,
    "customer_notes" TEXT,
    "terms_and_conditions" TEXT,
    "attachments" JSONB,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "updated_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" INTEGER,
    "deleted_date" TIMESTAMP(3),
    "deleted_by" INTEGER,
    "salesPartnerId" INTEGER,

    CONSTRAINT "recurring_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recurring_invoice_details" (
    "id" SERIAL NOT NULL,
    "recurring_invoice_id" INTEGER NOT NULL,
    "item_id" INTEGER NOT NULL,
    "description" TEXT,
    "quantity" DECIMAL(18,3) NOT NULL,
    "rate" DECIMAL(18,3) NOT NULL,
    "discount_amount" DECIMAL(18,3) DEFAULT 0.000,
    "vat_rate_id" INTEGER,
    "line_total" DECIMAL(18,3) NOT NULL,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "updated_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" INTEGER,
    "deleted_date" TIMESTAMP(3),
    "deleted_by" INTEGER,

    CONSTRAINT "recurring_invoice_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_notes" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "delivery_note_number" VARCHAR(50) NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "quotation_id" INTEGER,
    "invoice_id" INTEGER,
    "delivery_date" DATE NOT NULL,
    "status" VARCHAR(50) DEFAULT 'Draft',
    "delivery_address" TEXT,
    "shipping_method" VARCHAR(100),
    "tracking_number" VARCHAR(100),
    "notes" TEXT,
    "terms_and_conditions" TEXT,
    "sub_total" DECIMAL(18,3) DEFAULT 0.000,
    "total_vat" DECIMAL(18,3) DEFAULT 0.000,
    "grand_total" DECIMAL(18,3) DEFAULT 0.000,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "updated_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" INTEGER,
    "deleted_date" TIMESTAMP(3),
    "deleted_by" INTEGER,

    CONSTRAINT "delivery_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_note_details" (
    "id" SERIAL NOT NULL,
    "delivery_note_id" INTEGER NOT NULL,
    "item_id" INTEGER NOT NULL,
    "description" TEXT,
    "quantity" DECIMAL(18,3) NOT NULL,
    "rate" DECIMAL(18,3),
    "line_total" DECIMAL(18,3),
    "vat_rate_id" INTEGER,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "updated_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" INTEGER,

    CONSTRAINT "delivery_note_details_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "quotations_client_id_quotation_number_key" ON "quotations"("client_id", "quotation_number");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_client_id_invoice_number_key" ON "invoices"("client_id", "invoice_number");

-- CreateIndex
CREATE UNIQUE INDEX "recurring_invoices_client_id_profile_name_key" ON "recurring_invoices"("client_id", "profile_name");

-- CreateIndex
CREATE UNIQUE INDEX "delivery_notes_client_id_delivery_note_number_key" ON "delivery_notes"("client_id", "delivery_note_number");

-- AddForeignKey
ALTER TABLE "purchase_vendors" ADD CONSTRAINT "purchase_vendors_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_vat_rate_id_fkey" FOREIGN KEY ("vat_rate_id") REFERENCES "vat_rates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "client_currencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_sales_person_id_fkey" FOREIGN KEY ("sales_person_id") REFERENCES "sales_persons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_details" ADD CONSTRAINT "quotation_details_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_details" ADD CONSTRAINT "quotation_details_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_details" ADD CONSTRAINT "quotation_details_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "quotations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_details" ADD CONSTRAINT "quotation_details_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_details" ADD CONSTRAINT "quotation_details_vat_rate_id_fkey" FOREIGN KEY ("vat_rate_id") REFERENCES "vat_rates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "client_currencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "quotations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_sales_partner_id_fkey" FOREIGN KEY ("sales_partner_id") REFERENCES "sales_partners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_sales_person_id_fkey" FOREIGN KEY ("sales_person_id") REFERENCES "sales_persons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_details" ADD CONSTRAINT "invoice_details_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_details" ADD CONSTRAINT "invoice_details_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_details" ADD CONSTRAINT "invoice_details_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_details" ADD CONSTRAINT "invoice_details_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_details" ADD CONSTRAINT "invoice_details_vat_rate_id_fkey" FOREIGN KEY ("vat_rate_id") REFERENCES "vat_rates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_invoices" ADD CONSTRAINT "recurring_invoices_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_invoices" ADD CONSTRAINT "recurring_invoices_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_invoices" ADD CONSTRAINT "recurring_invoices_accounts_receivable_id_fkey" FOREIGN KEY ("accounts_receivable_id") REFERENCES "chart_of_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_invoices" ADD CONSTRAINT "recurring_invoices_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_invoices" ADD CONSTRAINT "recurring_invoices_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_invoices" ADD CONSTRAINT "recurring_invoices_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_invoices" ADD CONSTRAINT "recurring_invoices_salesPartnerId_fkey" FOREIGN KEY ("salesPartnerId") REFERENCES "sales_partners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_invoice_details" ADD CONSTRAINT "recurring_invoice_details_recurring_invoice_id_fkey" FOREIGN KEY ("recurring_invoice_id") REFERENCES "recurring_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_invoice_details" ADD CONSTRAINT "recurring_invoice_details_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_invoice_details" ADD CONSTRAINT "recurring_invoice_details_vat_rate_id_fkey" FOREIGN KEY ("vat_rate_id") REFERENCES "vat_rates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_invoice_details" ADD CONSTRAINT "recurring_invoice_details_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_invoice_details" ADD CONSTRAINT "recurring_invoice_details_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_notes" ADD CONSTRAINT "delivery_notes_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_notes" ADD CONSTRAINT "delivery_notes_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_notes" ADD CONSTRAINT "delivery_notes_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "quotations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_notes" ADD CONSTRAINT "delivery_notes_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_notes" ADD CONSTRAINT "delivery_notes_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_notes" ADD CONSTRAINT "delivery_notes_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_notes" ADD CONSTRAINT "delivery_notes_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_note_details" ADD CONSTRAINT "delivery_note_details_delivery_note_id_fkey" FOREIGN KEY ("delivery_note_id") REFERENCES "delivery_notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_note_details" ADD CONSTRAINT "delivery_note_details_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_note_details" ADD CONSTRAINT "delivery_note_details_vat_rate_id_fkey" FOREIGN KEY ("vat_rate_id") REFERENCES "vat_rates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_note_details" ADD CONSTRAINT "delivery_note_details_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_note_details" ADD CONSTRAINT "delivery_note_details_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
