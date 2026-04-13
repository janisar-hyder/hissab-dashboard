-- CreateTable
CREATE TABLE "super_admin_roles" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "status" VARCHAR(50) DEFAULT 'Active',
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "updated_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" INTEGER,

    CONSTRAINT "super_admin_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "super_admin_role_permissions" (
    "id" SERIAL NOT NULL,
    "role_id" INTEGER NOT NULL,
    "module_name" VARCHAR(150) NOT NULL,
    "can_create" BOOLEAN DEFAULT false,
    "can_view" BOOLEAN DEFAULT true,
    "can_update" BOOLEAN DEFAULT false,
    "can_delete" BOOLEAN DEFAULT false,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "updated_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" INTEGER,

    CONSTRAINT "super_admin_role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "super_admin_users" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role_id" INTEGER,
    "status" VARCHAR(50) DEFAULT 'Active',
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "updated_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" INTEGER,

    CONSTRAINT "super_admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" SERIAL NOT NULL,
    "client_num" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "cr_num" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "mobile" VARCHAR(50),
    "account_manager_id" INTEGER,
    "billing_cycle" VARCHAR(50),
    "sub_model" VARCHAR(50),
    "num_users" INTEGER DEFAULT 1,
    "sub_start_date" DATE,
    "sub_end_date" DATE,
    "hosting" VARCHAR(50),
    "amount" DECIMAL(18,3),
    "annual_maintenance_cost" DECIMAL(18,3),
    "cloud_charges" DECIMAL(18,3),
    "default_language" VARCHAR(50) DEFAULT 'English',
    "time_zone" VARCHAR(100) DEFAULT 'UTC+3:00',
    "date_format" VARCHAR(50),
    "time_format" VARCHAR(50),
    "base_currency" VARCHAR(10) DEFAULT 'BHD',
    "currency_format" VARCHAR(50),
    "logo_path" VARCHAR(512),
    "client_admin_username" VARCHAR(255) NOT NULL,
    "client_admin_password" VARCHAR(255) NOT NULL,
    "remarks" TEXT,
    "is_active" BOOLEAN DEFAULT true,
    "deleted_at" TIMESTAMP(3),
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "updated_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" INTEGER,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_roles" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "status" VARCHAR(50) DEFAULT 'Active',
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "updated_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" INTEGER,

    CONSTRAINT "client_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_role_permissions" (
    "id" SERIAL NOT NULL,
    "role_id" INTEGER NOT NULL,
    "module_name" VARCHAR(150) NOT NULL,
    "can_create" BOOLEAN DEFAULT false,
    "can_view" BOOLEAN DEFAULT true,
    "can_update" BOOLEAN DEFAULT false,
    "can_delete" BOOLEAN DEFAULT false,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "updated_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" INTEGER,

    CONSTRAINT "client_role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_users" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role_id" INTEGER,
    "status" VARCHAR(50) DEFAULT 'Active',
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "updated_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" INTEGER,

    CONSTRAINT "client_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_contacts" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "first_name" VARCHAR(100),
    "last_name" VARCHAR(100),
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "designation" VARCHAR(150),
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "updated_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" INTEGER,

    CONSTRAINT "client_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_permissions" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "module_name" VARCHAR(150) NOT NULL,
    "can_create" BOOLEAN DEFAULT false,
    "can_view" BOOLEAN DEFAULT true,
    "can_update" BOOLEAN DEFAULT false,
    "can_delete" BOOLEAN DEFAULT false,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "updated_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" INTEGER,

    CONSTRAINT "client_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chart_of_accounts" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "code" VARCHAR(50),
    "type" VARCHAR(100) NOT NULL,
    "parent_id" INTEGER,
    "description" TEXT,
    "status" VARCHAR(50) DEFAULT 'Active',
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "updated_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" INTEGER,

    CONSTRAINT "chart_of_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_vendors" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "type" VARCHAR(50),
    "primary_contact" VARCHAR(255),
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "mobile" VARCHAR(50),
    "tax_treatment" VARCHAR(100),
    "currency" VARCHAR(10) DEFAULT 'BHD',
    "opening_balance" DECIMAL(18,3) DEFAULT 0.000,
    "payment_terms" VARCHAR(100),
    "billing_attention" VARCHAR(255),
    "billing_country" VARCHAR(100),
    "billing_address" TEXT,
    "billing_city" VARCHAR(100),
    "shipment_attention" VARCHAR(255),
    "shipment_country" VARCHAR(100),
    "shipment_address" TEXT,
    "shipment_city" VARCHAR(100),
    "remarks" TEXT,
    "status" VARCHAR(50) DEFAULT 'Active',
    "is_active" BOOLEAN DEFAULT true,
    "deleted_at" TIMESTAMP(3),
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "updated_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" INTEGER,

    CONSTRAINT "purchase_vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_vendor_contacts" (
    "id" SERIAL NOT NULL,
    "vendor_id" INTEGER NOT NULL,
    "salutation" VARCHAR(20),
    "first_name" VARCHAR(100),
    "last_name" VARCHAR(100),
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "mobile" VARCHAR(50),
    "designation" VARCHAR(150),
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "updated_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" INTEGER,

    CONSTRAINT "purchase_vendor_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_categories" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "status" VARCHAR(50) DEFAULT 'Active',
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "updated_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" INTEGER,

    CONSTRAINT "inventory_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_sub_categories" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "status" VARCHAR(50) DEFAULT 'Active',
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "updated_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" INTEGER,

    CONSTRAINT "inventory_sub_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_unit_of_measures" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "status" VARCHAR(50) DEFAULT 'Active',
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "updated_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" INTEGER,

    CONSTRAINT "inventory_unit_of_measures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vat_settings" (
    "client_id" INTEGER NOT NULL,
    "is_vat_registered" BOOLEAN DEFAULT false,
    "updated_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" INTEGER,

    CONSTRAINT "vat_settings_pkey" PRIMARY KEY ("client_id")
);

-- CreateTable
CREATE TABLE "vat_rates" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "rate" DECIMAL(5,2) NOT NULL,
    "status" VARCHAR(50) DEFAULT 'Active',
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "updated_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" INTEGER,

    CONSTRAINT "vat_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "item_code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "sku" VARCHAR(100),
    "description" TEXT,
    "uom_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,
    "sub_category_id" INTEGER,
    "sales_rate" DECIMAL(18,3),
    "vat_preference" VARCHAR(50),
    "sales_account_id" INTEGER,
    "sales_description" TEXT,
    "purchase_cost" DECIMAL(18,3),
    "reorder_point" INTEGER DEFAULT 0,
    "purchase_account_id" INTEGER,
    "purchase_description" TEXT,
    "inventory_account_id" INTEGER,
    "stock_in_hand" DECIMAL(18,3) DEFAULT 0,
    "status" VARCHAR(50) DEFAULT 'Active',
    "warranty_period" VARCHAR(100),
    "shelf_life" VARCHAR(100),
    "vendor_id" INTEGER,
    "weight_per_unit" DECIMAL(18,3),
    "weight_uom_id" INTEGER,
    "valuation_method" VARCHAR(50),
    "volume_per_unit" DECIMAL(18,3),
    "volume_uom_id" INTEGER,
    "inventory_description" TEXT,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "updated_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" INTEGER,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "type" VARCHAR(50),
    "primary_contact" VARCHAR(255),
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "mobile" VARCHAR(50),
    "tax_treatment" VARCHAR(100),
    "currency" VARCHAR(10) DEFAULT 'BHD',
    "opening_balance" DECIMAL(18,3) DEFAULT 0.000,
    "source_of_supply" VARCHAR(255),
    "payment_terms" VARCHAR(100),
    "billing_attention" VARCHAR(255),
    "billing_country" VARCHAR(100),
    "billing_address" TEXT,
    "billing_city" VARCHAR(100),
    "shipment_attention" VARCHAR(255),
    "shipment_country" VARCHAR(100),
    "shipment_address" TEXT,
    "shipment_city" VARCHAR(100),
    "remarks" TEXT,
    "is_active" BOOLEAN DEFAULT true,
    "deleted_at" TIMESTAMP(3),
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "updated_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" INTEGER,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_contacts" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "salutation" VARCHAR(20),
    "first_name" VARCHAR(100),
    "last_name" VARCHAR(100),
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "designation" VARCHAR(150),
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "updated_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" INTEGER,

    CONSTRAINT "customer_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "super_admin_roles_name_key" ON "super_admin_roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "super_admin_users_email_key" ON "super_admin_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "clients_client_num_key" ON "clients"("client_num");

-- CreateIndex
CREATE UNIQUE INDEX "client_roles_client_id_name_key" ON "client_roles"("client_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "client_users_client_id_email_key" ON "client_users"("client_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "chart_of_accounts_client_id_name_key" ON "chart_of_accounts"("client_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "chart_of_accounts_client_id_code_key" ON "chart_of_accounts"("client_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_categories_client_id_name_key" ON "inventory_categories"("client_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_sub_categories_client_id_category_id_name_key" ON "inventory_sub_categories"("client_id", "category_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_unit_of_measures_client_id_name_key" ON "inventory_unit_of_measures"("client_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "vat_rates_client_id_name_key" ON "vat_rates"("client_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_items_client_id_item_code_key" ON "inventory_items"("client_id", "item_code");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_items_client_id_sku_key" ON "inventory_items"("client_id", "sku");

-- AddForeignKey
ALTER TABLE "super_admin_roles" ADD CONSTRAINT "super_admin_roles_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "super_admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "super_admin_roles" ADD CONSTRAINT "super_admin_roles_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "super_admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "super_admin_role_permissions" ADD CONSTRAINT "super_admin_role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "super_admin_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "super_admin_role_permissions" ADD CONSTRAINT "super_admin_role_permissions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "super_admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "super_admin_role_permissions" ADD CONSTRAINT "super_admin_role_permissions_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "super_admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "super_admin_users" ADD CONSTRAINT "super_admin_users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "super_admin_roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "super_admin_users" ADD CONSTRAINT "super_admin_users_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "super_admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "super_admin_users" ADD CONSTRAINT "super_admin_users_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "super_admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_account_manager_id_fkey" FOREIGN KEY ("account_manager_id") REFERENCES "super_admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "super_admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "super_admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_roles" ADD CONSTRAINT "client_roles_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_roles" ADD CONSTRAINT "client_roles_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_roles" ADD CONSTRAINT "client_roles_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_role_permissions" ADD CONSTRAINT "client_role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "client_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_users" ADD CONSTRAINT "client_users_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_users" ADD CONSTRAINT "client_users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "client_roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_users" ADD CONSTRAINT "client_users_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_users" ADD CONSTRAINT "client_users_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_contacts" ADD CONSTRAINT "client_contacts_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_contacts" ADD CONSTRAINT "client_contacts_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_contacts" ADD CONSTRAINT "client_contacts_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_permissions" ADD CONSTRAINT "client_permissions_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_permissions" ADD CONSTRAINT "client_permissions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_permissions" ADD CONSTRAINT "client_permissions_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chart_of_accounts" ADD CONSTRAINT "chart_of_accounts_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chart_of_accounts" ADD CONSTRAINT "chart_of_accounts_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "chart_of_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chart_of_accounts" ADD CONSTRAINT "chart_of_accounts_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chart_of_accounts" ADD CONSTRAINT "chart_of_accounts_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_vendors" ADD CONSTRAINT "purchase_vendors_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_vendors" ADD CONSTRAINT "purchase_vendors_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_vendors" ADD CONSTRAINT "purchase_vendors_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_vendor_contacts" ADD CONSTRAINT "purchase_vendor_contacts_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "purchase_vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_vendor_contacts" ADD CONSTRAINT "purchase_vendor_contacts_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_vendor_contacts" ADD CONSTRAINT "purchase_vendor_contacts_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_categories" ADD CONSTRAINT "inventory_categories_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_categories" ADD CONSTRAINT "inventory_categories_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_categories" ADD CONSTRAINT "inventory_categories_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_sub_categories" ADD CONSTRAINT "inventory_sub_categories_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_sub_categories" ADD CONSTRAINT "inventory_sub_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "inventory_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_sub_categories" ADD CONSTRAINT "inventory_sub_categories_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_sub_categories" ADD CONSTRAINT "inventory_sub_categories_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_unit_of_measures" ADD CONSTRAINT "inventory_unit_of_measures_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_unit_of_measures" ADD CONSTRAINT "inventory_unit_of_measures_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_unit_of_measures" ADD CONSTRAINT "inventory_unit_of_measures_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vat_settings" ADD CONSTRAINT "vat_settings_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vat_settings" ADD CONSTRAINT "vat_settings_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vat_rates" ADD CONSTRAINT "vat_rates_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vat_rates" ADD CONSTRAINT "vat_rates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vat_rates" ADD CONSTRAINT "vat_rates_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_uom_id_fkey" FOREIGN KEY ("uom_id") REFERENCES "inventory_unit_of_measures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "inventory_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_sub_category_id_fkey" FOREIGN KEY ("sub_category_id") REFERENCES "inventory_sub_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_sales_account_id_fkey" FOREIGN KEY ("sales_account_id") REFERENCES "chart_of_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_purchase_account_id_fkey" FOREIGN KEY ("purchase_account_id") REFERENCES "chart_of_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_inventory_account_id_fkey" FOREIGN KEY ("inventory_account_id") REFERENCES "chart_of_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "purchase_vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_weight_uom_id_fkey" FOREIGN KEY ("weight_uom_id") REFERENCES "inventory_unit_of_measures"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_volume_uom_id_fkey" FOREIGN KEY ("volume_uom_id") REFERENCES "inventory_unit_of_measures"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_contacts" ADD CONSTRAINT "customer_contacts_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_contacts" ADD CONSTRAINT "customer_contacts_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_contacts" ADD CONSTRAINT "customer_contacts_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
