/*
  Warnings:

  - A unique constraint covering the columns `[articleId]` on the table `AIArticleSummary` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[articleId]` on the table `ScrapedArticle` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[aiArticleSummaryId]` on the table `ScrapedArticle` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "AIArticleSummary" DROP CONSTRAINT "AIArticleSummary_articleId_fkey";

-- DropForeignKey
ALTER TABLE "ScrapedArticle" DROP CONSTRAINT "ScrapedArticle_articleId_fkey";

-- AlterTable
ALTER TABLE "AIArticleSummary" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "articleId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ScrapedArticle" ADD COLUMN     "aiArticleSummaryId" INTEGER,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "articleId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "AIBatch" (
    "id" SERIAL NOT NULL,
    "batchId" TEXT NOT NULL,
    "processingStatus" TEXT NOT NULL,
    "batchCompletedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIBatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AIArticleSummary_articleId_key" ON "AIArticleSummary"("articleId");

-- CreateIndex
CREATE UNIQUE INDEX "ScrapedArticle_articleId_key" ON "ScrapedArticle"("articleId");

-- CreateIndex
CREATE UNIQUE INDEX "ScrapedArticle_aiArticleSummaryId_key" ON "ScrapedArticle"("aiArticleSummaryId");

-- AddForeignKey
ALTER TABLE "ScrapedArticle" ADD CONSTRAINT "ScrapedArticle_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScrapedArticle" ADD CONSTRAINT "ScrapedArticle_aiArticleSummaryId_fkey" FOREIGN KEY ("aiArticleSummaryId") REFERENCES "AIArticleSummary"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIArticleSummary" ADD CONSTRAINT "AIArticleSummary_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE SET NULL ON UPDATE CASCADE;
