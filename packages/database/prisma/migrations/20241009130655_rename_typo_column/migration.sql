/*
  Warnings:

  - You are about to drop the column `aplha_2_code` on the `Country` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Country" DROP COLUMN "aplha_2_code",
ADD COLUMN     "alpha_2_code" TEXT;
