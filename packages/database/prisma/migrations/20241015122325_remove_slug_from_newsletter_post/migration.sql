/*
  Warnings:

  - You are about to drop the column `slug` on the `NewsletterPost` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "NewsletterPost_slug_key";

-- AlterTable
ALTER TABLE "NewsletterPost" DROP COLUMN "slug";
