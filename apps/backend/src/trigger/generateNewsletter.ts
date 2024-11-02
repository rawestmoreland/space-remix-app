import { prisma } from '@/prisma';
import { logger, schedules } from '@trigger.dev/sdk/v3';
import {
  generateNewsletterXML,
  processNewsletterData,
} from '@/common/utils/processNewsletterData';
import { NewsletterPostStatus } from '@prisma/client';

export const checkAIBatches = schedules.task({
  id: 'generate-newsletter',
  // every saturday at 8 AM
  cron: '0 8 * * 6',
  maxDuration: 600, // 10 minutes
  run: async (payload, { ctx }) => {
    // Get the AI article summaries for the past week
    const articleSummaries = await prisma.aIArticleSummary.findMany({
      where: {
        createdAt: {
          gte: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), //
        },
      },
      include: {
        article: true,
      },
      take: 20,
    });

    // If there are no article summaries, return
    if (!articleSummaries.length) {
      return logger.log("Couldn't find any article summaries");
    }

    // Generate newsletter data with Claude
    let newsletterXML: string;
    try {
      newsletterXML = await generateNewsletterXML(articleSummaries, logger);
    } catch (error) {
      return logger.error(`Error generating newsletter XML: ${error}`);
    }

    // Process the newsletter data
    try {
      const processedData = await processNewsletterData(newsletterXML);

      if ('error' in processedData) {
        throw new Error(processedData.error);
      }

      await prisma.newsletterPost.create({
        data: {
          content: processedData.generatedHTML,
          slug: processedData.slug,
          author: 'Claude',
          title: processedData.title,
          description: processedData.summary,
          excerpt: processedData.summary,
          createdAt: new Date(),
          pubDate: new Date(),
          status: NewsletterPostStatus.DRAFT,
          AINewsletterGeneration: {
            create: {
              content: newsletterXML,
              createdAt: new Date(),
            },
          },
        },
      });

      return logger.log(
        'Generated newsletter data and saved it to the database'
      );
    } catch (error) {
      return logger.error(`Error processing newsletter data: ${error}`);
    }
  },
});
