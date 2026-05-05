-- CreateTable
CREATE TABLE "receipts" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "receipt_number" VARCHAR(100) NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "receipt_date" DATE NOT NULL,
    "payment_mode" VARCHAR(50),
    "deposit_to_id" INTEGER,
    "reference_number" VARCHAR(100),
    "amount_received" DECIMAL(18,3) NOT NULL,
    "bank_charges" DECIMAL(18,3) DEFAULT 0.000,
    "notes" TEXT,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "updated_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" INTEGER,
    "deleted_date" TIMESTAMP(3),
    "deleted_by" INTEGER,

    CONSTRAINT "receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receipt_applications" (
    "id" SERIAL NOT NULL,
    "receipt_id" INTEGER NOT NULL,
    "invoice_id" INTEGER NOT NULL,
    "amount_applied" DECIMAL(18,3) NOT NULL,

    CONSTRAINT "receipt_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_notes" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "credit_note_number" VARCHAR(100) NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "credit_note_date" DATE NOT NULL,
    "status" VARCHAR(50) DEFAULT 'Open',
    "reference_number" VARCHAR(100),
    "sales_person_id" INTEGER,
    "currency_id" INTEGER,
    "sub_total" DECIMAL(18,3) DEFAULT 0.000,
    "total_vat" DECIMAL(18,3) DEFAULT 0.000,
    "grand_total" DECIMAL(18,3) DEFAULT 0.000,
    "balance" DECIMAL(18,3) DEFAULT 0.000,
    "customer_notes" TEXT,
    "terms_and_conditions" TEXT,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "updated_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" INTEGER,
    "deleted_date" TIMESTAMP(3),
    "deleted_by" INTEGER,

    CONSTRAINT "credit_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_note_details" (
    "id" SERIAL NOT NULL,
    "credit_note_id" INTEGER NOT NULL,
    "item_id" INTEGER NOT NULL,
    "description" TEXT,
    "quantity" DECIMAL(18,3) NOT NULL,
    "rate" DECIMAL(18,3) NOT NULL,
    "vat_rate_id" INTEGER,
    "line_total" DECIMAL(18,3) NOT NULL,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "updated_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" INTEGER,

    CONSTRAINT "credit_note_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_note_applications" (
    "id" SERIAL NOT NULL,
    "credit_note_id" INTEGER NOT NULL,
    "invoice_id" INTEGER NOT NULL,
    "amount_applied" DECIMAL(18,3) NOT NULL,

    CONSTRAINT "credit_note_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "receipts_client_id_receipt_number_key" ON "receipts"("client_id", "receipt_number");

-- CreateIndex
CREATE UNIQUE INDEX "credit_notes_client_id_credit_note_number_key" ON "credit_notes"("client_id", "credit_note_number");

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_deposit_to_id_fkey" FOREIGN KEY ("deposit_to_id") REFERENCES "chart_of_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipt_applications" ADD CONSTRAINT "receipt_applications_receipt_id_fkey" FOREIGN KEY ("receipt_id") REFERENCES "receipts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipt_applications" ADD CONSTRAINT "receipt_applications_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_notes" ADD CONSTRAINT "credit_notes_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_notes" ADD CONSTRAINT "credit_notes_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_notes" ADD CONSTRAINT "credit_notes_sales_person_id_fkey" FOREIGN KEY ("sales_person_id") REFERENCES "sales_persons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_notes" ADD CONSTRAINT "credit_notes_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "client_currencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_notes" ADD CONSTRAINT "credit_notes_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_notes" ADD CONSTRAINT "credit_notes_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_notes" ADD CONSTRAINT "credit_notes_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_note_details" ADD CONSTRAINT "credit_note_details_credit_note_id_fkey" FOREIGN KEY ("credit_note_id") REFERENCES "credit_notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_note_details" ADD CONSTRAINT "credit_note_details_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_note_details" ADD CONSTRAINT "credit_note_details_vat_rate_id_fkey" FOREIGN KEY ("vat_rate_id") REFERENCES "vat_rates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_note_details" ADD CONSTRAINT "credit_note_details_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_note_details" ADD CONSTRAINT "credit_note_details_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_note_applications" ADD CONSTRAINT "credit_note_applications_credit_note_id_fkey" FOREIGN KEY ("credit_note_id") REFERENCES "credit_notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_note_applications" ADD CONSTRAINT "credit_note_applications_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
