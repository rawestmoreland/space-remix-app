-- CreateTable
CREATE TABLE "AINewsletterGeneration" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "newsletterPostId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AINewsletterGeneration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AINewsletterGeneration_newsletterPostId_key" ON "AINewsletterGeneration"("newsletterPostId");

-- AddForeignKey
ALTER TABLE "AINewsletterGeneration" ADD CONSTRAINT "AINewsletterGeneration_newsletterPostId_fkey" FOREIGN KEY ("newsletterPostId") REFERENCES "NewsletterPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
