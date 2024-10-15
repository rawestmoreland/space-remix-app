/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `NewsletterPost` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `NewsletterPost` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "NewsletterPost" ADD COLUMN     "author" TEXT NOT NULL DEFAULT 'Richard W.',
ADD COLUMN     "description" TEXT,
ADD COLUMN     "excerpt" TEXT,
ADD COLUMN     "pubDate" TIMESTAMP(3),
ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterPost_slug_key" ON "NewsletterPost"("slug");