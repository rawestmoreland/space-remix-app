import Anthropic from '@anthropic-ai/sdk';
import { createSummaryBatch, IRawArticle } from '@/common/utils/aiSummarizer';
import { prisma } from '@/prisma';
import { logger, schedules } from '@trigger.dev/sdk/v3';

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
            processingStatus: batchStatus.processing_status,
          },
        });

        for await (const result of await anthropic.beta.messages.batches.results(
          batch.batchId
        )) {
          switch (result.result.type) {
            case 'succeeded':
              logger.log(`Batch ${result.custom_id} succeeded`);
              logger.log(`Result: ${JSON.stringify(result, null, 2)}`);
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
