-- DropForeignKey
ALTER TABLE "AIArticleSummary" DROP CONSTRAINT "AIArticleSummary_articleId_fkey";

-- AddForeignKey
ALTER TABLE "AIArticleSummary" ADD CONSTRAINT "AIArticleSummary_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
