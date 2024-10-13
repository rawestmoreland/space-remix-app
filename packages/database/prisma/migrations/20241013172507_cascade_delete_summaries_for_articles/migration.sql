-- DropForeignKey
ALTER TABLE "ScrapedArticle" DROP CONSTRAINT "ScrapedArticle_articleId_fkey";

-- AddForeignKey
ALTER TABLE "ScrapedArticle" ADD CONSTRAINT "ScrapedArticle_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
