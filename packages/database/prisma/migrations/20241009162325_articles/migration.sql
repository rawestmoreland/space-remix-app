-- CreateEnum
CREATE TYPE "ArticleType" AS ENUM ('ARTICLE', 'BLOG');

-- CreateEnum
CREATE TYPE "ArticleSource" AS ENUM ('SPACEFLIGHT_NEWS_API');

-- CreateTable
CREATE TABLE "Article" (
    "id" SERIAL NOT NULL,
    "sourceId" INTEGER NOT NULL,
    "source" "ArticleSource" NOT NULL DEFAULT 'SPACEFLIGHT_NEWS_API',
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "newsSite" TEXT,
    "articleType" "ArticleType" DEFAULT 'ARTICLE',
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIArticleSummary" (
    "id" SERIAL NOT NULL,
    "articleId" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,

    CONSTRAINT "AIArticleSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarsAIAssessment" (
    "id" SERIAL NOT NULL,
    "assessmentDate" TIMESTAMP(3) NOT NULL,
    "progressScore" DOUBLE PRECISION NOT NULL,
    "keyDevelopments" TEXT NOT NULL,
    "challenges" TEXT NOT NULL,
    "overallAssessment" TEXT NOT NULL,

    CONSTRAINT "MarsAIAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Article_url_key" ON "Article"("url");

-- CreateIndex
CREATE UNIQUE INDEX "Article_sourceId_source_key" ON "Article"("sourceId", "source");

-- AddForeignKey
ALTER TABLE "AIArticleSummary" ADD CONSTRAINT "AIArticleSummary_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
