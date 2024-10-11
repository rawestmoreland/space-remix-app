import { prisma } from '@/prisma';
import Anthropic from '@anthropic-ai/sdk';

export interface IRawArticle {
  articleId: string;
  content: string;
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function createSummaryBatch(articles: IRawArticle[]) {
  try {
    const message_batch = await anthropic.beta.messages.batches.create({
      requests: articles.map((article) => ({
        custom_id: article.articleId,
        params: {
          model: 'claude-3-5-sonnet-20240620',
          max_tokens: 1024,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `You will be analyzing an article about space exploration to summarize information relevant to civilization's progress toward getting to Mars. Your task is to extract and summarize key points related to the following areas:\n\n1. Technological advancements\n2. Funding changes\n3. Public support shifts\n4. International cooperation developments\n5. Scientific discoveries\n\nHere is the article text to analyze:\n\n<article>\n${article.content}\n</article>\n\nPlease read and analyze the article carefully. For each of the five key areas listed above, summarize any relevant information found in the article. If no information is found for a particular area, state that explicitly.\n\nAfter summarizing the individual areas, provide a brief overall summary of the article's relevance to progress toward Mars exploration.\n\nPresent your findings in the following format:\n\n<technological_advancements>\nSummarize any relevant technological advancements mentioned in the article.\n</technological_advancements>\n\n<funding_changes>\nSummarize any relevant funding changes mentioned in the article.\n</funding_changes>\n\n<public_support>\nSummarize any relevant shifts in public support mentioned in the article.\n</public_support>\n\n<international_cooperation>\nSummarize any relevant developments in international cooperation mentioned in the article.\n</international_cooperation>\n\n<scientific_discoveries>\nSummarize any relevant scientific discoveries mentioned in the article.\n</scientific_discoveries>\n\n<overall_summary>\nProvide a brief overall summary of the article's relevance to progress toward Mars exploration, based on the information found in the above categories.\n</overall_summary>\n\nEnsure that your summaries are concise and focused on information directly related to Mars exploration efforts. If the article contains no relevant information for a particular category or for Mars exploration in general, clearly state this in your response.`,
                },
              ],
            },
          ],
        },
      })),
    });

    // Save the batch ID for future reference
    await prisma.aIBatch.create({
      data: {
        batchId: message_batch.id,
        processingStatus: message_batch.processing_status,
      },
    });

    return { success: true, message: message_batch };
  } catch (error: any) {
    console.error(`Error summarizing article: ${error}`);
    return {
      error: true,
      errorMessage: error.message ?? 'Error summarizing article',
    };
  }
}
