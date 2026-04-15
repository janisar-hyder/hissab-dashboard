-- AlterTable
ALTER TABLE "vat_settings" ADD COLUMN     "tax_registration_number" VARCHAR(100),
ADD COLUMN     "vat_registered_on" DATE;

-- CreateTable
CREATE TABLE "sales_persons" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "status" VARCHAR(50) DEFAULT 'Active',
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "updated_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" INTEGER,

    CONSTRAINT "sales_persons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_partners" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "commission" DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    "description" TEXT,
    "status" VARCHAR(50) DEFAULT 'Active',
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "updated_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" INTEGER,

    CONSTRAINT "sales_partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_currencies" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "symbol" VARCHAR(10) NOT NULL,
    "is_base" BOOLEAN DEFAULT false,
    "decimal_places" INTEGER DEFAULT 2,
    "format" VARCHAR(50),
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "updated_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" INTEGER,

    CONSTRAINT "client_currencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_profiles" (
    "client_id" INTEGER NOT NULL,
    "company_name" VARCHAR(255),
    "cr_number" VARCHAR(100),
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "mobile" VARCHAR(50),
    "fiscal_year" VARCHAR(100),
    "fiscal_start_date" VARCHAR(10),
    "fiscal_period" VARCHAR(100),
    "logo_path" VARCHAR(512),
    "billing_attention" VARCHAR(255),
    "billing_country" VARCHAR(100),
    "billing_address" TEXT,
    "billing_city" VARCHAR(100),
    "shipment_attention" VARCHAR(255),
    "shipment_country" VARCHAR(100),
    "shipment_address" TEXT,
    "shipment_city" VARCHAR(100),
    "default_language" VARCHAR(50) DEFAULT 'English',
    "time_zone" VARCHAR(100) DEFAULT 'UTC + 3:00',
    "date_format" VARCHAR(100),
    "currency_format" VARCHAR(50),
    "updated_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" INTEGER,

    CONSTRAINT "company_profiles_pkey" PRIMARY KEY ("client_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sales_persons_client_id_name_key" ON "sales_persons"("client_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "sales_partners_client_id_name_key" ON "sales_partners"("client_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "client_currencies_client_id_code_key" ON "client_currencies"("client_id", "code");

-- AddForeignKey
ALTER TABLE "sales_persons" ADD CONSTRAINT "sales_persons_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_persons" ADD CONSTRAINT "sales_persons_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_persons" ADD CONSTRAINT "sales_persons_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_partners" ADD CONSTRAINT "sales_partners_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_partners" ADD CONSTRAINT "sales_partners_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_partners" ADD CONSTRAINT "sales_partners_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_currencies" ADD CONSTRAINT "client_currencies_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_currencies" ADD CONSTRAINT "client_currencies_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_currencies" ADD CONSTRAINT "client_currencies_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_profiles" ADD CONSTRAINT "company_profiles_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_profiles" ADD CONSTRAINT "company_profiles_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
