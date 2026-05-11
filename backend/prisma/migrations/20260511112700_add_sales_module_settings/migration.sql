-- CreateTable
CREATE TABLE "sales_module_settings" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "module" VARCHAR(50) NOT NULL,
    "default_note" TEXT,
    "default_terms" TEXT,
    "created_by" INTEGER,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" INTEGER,
    "updated_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sales_module_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sales_module_settings_client_id_module_key" ON "sales_module_settings"("client_id", "module");

-- AddForeignKey
ALTER TABLE "sales_module_settings" ADD CONSTRAINT "sales_module_settings_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
