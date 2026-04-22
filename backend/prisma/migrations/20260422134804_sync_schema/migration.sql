/*
  Warnings:

  - You are about to drop the column `code` on the `chart_of_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `purchase_vendors` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "chart_of_accounts_client_id_code_key";

-- AlterTable
ALTER TABLE "chart_of_accounts" DROP COLUMN "code";

-- AlterTable
ALTER TABLE "customers" DROP COLUMN "currency",
ADD COLUMN     "currency_id" INTEGER;

-- AlterTable
ALTER TABLE "purchase_vendors" DROP COLUMN "currency",
ADD COLUMN     "currency_id" INTEGER;

-- AddForeignKey
ALTER TABLE "purchase_vendors" ADD CONSTRAINT "purchase_vendors_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "client_currencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "client_currencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
