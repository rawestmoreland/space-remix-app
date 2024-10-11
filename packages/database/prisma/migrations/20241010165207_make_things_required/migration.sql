/*
  Warnings:

  - Made the column `articleId` on table `AIArticleSummary` required. This step will fail if there are existing NULL values in that column.
  - Made the column `articleId` on table `ScrapedArticle` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "AIArticleSummary" DROP CONSTRAINT "AIArticleSummary_articleId_fkey";

-- DropForeignKey
ALTER TABLE "ScrapedArticle" DROP CONSTRAINT "ScrapedArticle_articleId_fkey";

-- AlterTable
ALTER TABLE "AIArticleSummary" ALTER COLUMN "articleId" SET NOT NULL;

-- AlterTable
ALTER TABLE "ScrapedArticle" ALTER COLUMN "articleId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "ScrapedArticle" ADD CONSTRAINT "ScrapedArticle_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIArticleSummary" ADD CONSTRAINT "AIArticleSummary_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
