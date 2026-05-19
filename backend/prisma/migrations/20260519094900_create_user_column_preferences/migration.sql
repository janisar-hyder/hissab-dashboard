-- CreateTable
CREATE TABLE "user_column_preferences" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "page_id" VARCHAR(100) NOT NULL,
    "columns" JSONB NOT NULL,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_column_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_column_preferences_client_id_user_id_page_id_key" ON "user_column_preferences"("client_id", "user_id", "page_id");

-- AddForeignKey
ALTER TABLE "user_column_preferences" ADD CONSTRAINT "user_column_preferences_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_column_preferences" ADD CONSTRAINT "user_column_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "client_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
