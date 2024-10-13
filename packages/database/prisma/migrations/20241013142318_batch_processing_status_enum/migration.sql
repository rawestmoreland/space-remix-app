/*
  Warnings:

  - The `processingStatus` column on the `AIBatch` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `category` to the `AIArticleSummary` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BatchStatus" AS ENUM ('in_progress', 'ended', 'canceling');

-- AlterTable
ALTER TABLE "AIArticleSummary" ADD COLUMN     "category" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "AIBatch" DROP COLUMN "processingStatus",
ADD COLUMN     "processingStatus" "BatchStatus" NOT NULL DEFAULT 'in_progress';
