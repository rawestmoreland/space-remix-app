import { createSummaryBatch, IRawArticle } from '@/common/utils/aiSummarizer';
import { prisma } from '@/prisma';
import { logger, schedules } from '@trigger.dev/sdk/v3';

export const sendBatchForSummary = schedules.task({
  id: 'send-batch-for-summary',
  // Once a day at 10 PM
  cron: '0 22 * * *',
  maxDuration: 600, // 10 minutes
  run: async (payload, { ctx }) => {
    // Get all articles with scraped content that have not been summarized
    const unsummarizedArticles = await prisma.article.findMany({
      where: {
        AIArticleSummary: {
          is: null,
        },
        ScrapedArticle: {
          isNot: null,
        },
      },
      include: {
        AIArticleSummary: true,
        ScrapedArticle: {
          select: {
            content: true,
          },
        },
      },
    });

    const batchData = await prisma.aIBatch.findMany({
      where: {
        processingStatus: 'in_progress',
      },
    });

    // Filter out articles that are already in a batch. Batches may contain metadata [{articleId: string}, {articleId: string}]
    const articlesInBatches = batchData.flatMap(
      (batch) => (batch.metadata as { articleId: string }[]) || []
    );
    // Filter out articles that are already in a batch
    const unsummarizedArticlesFiltered = unsummarizedArticles.filter(
      (article) => {
        return !articlesInBatches.some(
          (articleInBatch: { articleId: string }) =>
            articleInBatch.articleId === article.id.toString()
        );
      }
    );

    if (unsummarizedArticlesFiltered.length < 1) {
      return logger.log("Couldn't find any unsummarized articles");
    }

    logger.log(`Summarizing ${unsummarizedArticlesFiltered.length} articles`);

    const articlesContent: IRawArticle[] = unsummarizedArticlesFiltered
      .filter((article) => article.ScrapedArticle?.content)
      .map((article) => {
        return {
          articleId: article.id.toString(),
          content: article.ScrapedArticle?.content || '',
        };
      });

    if (!articlesContent) {
      return logger.log("Couldn't find any articles content");
    }

    const batchResponse = await createSummaryBatch(articlesContent);

    if (!batchResponse.success) {
      return logger.error(
        'Error sending batch for summary',
        batchResponse.errorMessage
      );
    }

    // Send the articles to the summarizer as a batch
    return logger.log(JSON.stringify(batchResponse.message, null, 2));
  },
});
