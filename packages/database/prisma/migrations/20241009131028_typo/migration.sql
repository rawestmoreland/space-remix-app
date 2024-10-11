/*
  Warnings:

  - Made the column `alpha_2_code` on table `Country` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Country" ALTER COLUMN "alpha_2_code" SET NOT NULL;
