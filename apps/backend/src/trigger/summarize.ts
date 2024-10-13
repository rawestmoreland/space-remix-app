import { createSummaryBatch, IRawArticle } from '@/common/utils/aiSummarizer';
import { prisma } from '@/prisma';
import { logger, schedules } from '@trigger.dev/sdk/v3';

export const sendBatchForSummary = schedules.task({
  id: 'send-batch-for-summary',
  // every 1 hour,
  cron: '0 */1 * * *',
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

    if (!unsummarizedArticles) {
      return logger.log("Couldn't find any unsummarized articles");
    }

    logger.log(`Summarizing ${unsummarizedArticles.length} articles`);

    const articlesContent: IRawArticle[] = unsummarizedArticles
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
    logger.log(JSON.stringify(batchResponse.message, null, 2));
  },
});
