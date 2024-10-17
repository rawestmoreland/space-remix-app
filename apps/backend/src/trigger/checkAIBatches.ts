import Anthropic from '@anthropic-ai/sdk';
import { IRawArticle } from '@/common/utils/aiSummarizer';
import { prisma } from '@/prisma';
import { logger, schedules } from '@trigger.dev/sdk/v3';
import { extractArticleSummary, extractCategory } from '@/common/utils/regex';

const anthropic = new Anthropic();

export const checkAIBatches = schedules.task({
  id: 'check-ai-batches',
  // every 1 hour,
  cron: '0 */1 * * *',
  maxDuration: 600, // 10 minutes
  run: async (payload, { ctx }) => {
    // Check for Anthropic AI batches that are still processing
    const unprocessedBatches = await prisma.aIBatch.findMany({
      where: {
        processingStatus: 'in_progress',
      },
    });

    // If there are no unprocessed batches, return
    if (!unprocessedBatches) {
      return logger.log("Couldn't find any unprocessed batches");
    }

    // Process the batch if it's processing_status is "ended"
    for (const batch of unprocessedBatches) {
      const batchStatus = await anthropic.beta.messages.batches.retrieve(
        batch.batchId
      );

      if (batchStatus.processing_status === 'in_progress') {
        logger.log(`Batch ${batch.batchId} is still processing`);
        continue;
      } else if (batchStatus.processing_status === 'ended') {
        // If the batch is done processing, update the batch status
        await prisma.aIBatch.update({
          where: {
            id: batch.id,
          },
          data: {
            batchCompletedAt: batchStatus.ended_at,
            processingStatus: batchStatus.processing_status,
          },
        });

        for await (const result of await anthropic.beta.messages.batches.results(
          batch.batchId
        )) {
          switch (result.result.type) {
            case 'succeeded':
              let articleSummary: string | null = null;
              // Add the summary to the DB and associate the article with it
              if (result.result.message.content?.[0].type !== 'text') {
                logger.error(`Invalid content type: ${result.custom_id}`);
                continue;
              } else {
                if (!result.result.message.content[0].text) {
                  logger.error(`Empty content: ${result.custom_id}`);
                  continue;
                } else {
                  articleSummary = extractArticleSummary(
                    result.result.message.content[0].text
                  );
                  const articleCategory = extractCategory(
                    result.result.message.content[0].text
                  );
                  if (!articleSummary) {
                    logger.error(`Empty summary: ${result.custom_id}`);

                    // If the summary is empty, delete the article from the DB
                    await prisma.article.delete({
                      where: {
                        id: parseInt(result.custom_id),
                      },
                    });

                    continue;
                  }
                  await prisma.aIArticleSummary.create({
                    data: {
                      category: articleCategory,
                      summary: articleSummary,
                      article: {
                        connect: {
                          id: parseInt(result.custom_id),
                        },
                      },
                    },
                  });
                }
              }
              break;
            case 'errored':
              if (result.result.error?.type === ('invalid_request' as any)) {
                logger.error(`Validation error: ${result.custom_id}`);
              } else {
                logger.error(`Server error: ${result.custom_id}`);
              }
              break;
            case 'expired':
              logger.error(`Batch ${result.custom_id} expired`);
              break;
            case 'canceled':
              logger.error(`Batch ${result.custom_id} was canceled`);
              break;
            default:
              logger.error(`Unknown result: ${result.custom_id}`);
              break;
          }
        }
      }
    }

    return logger.log(`Processed ${unprocessedBatches.length} batches`);
  },
});
