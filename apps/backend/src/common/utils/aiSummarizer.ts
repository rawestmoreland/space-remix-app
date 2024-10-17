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
                  text: `You will be analyzing an article about space exploration to summarize information relevant to civilization's progress toward advancing space exploration. Your task is to extract and summarize key points related to the following areas:

                          1. Technological advancements
                          2. Funding changes
                          3. Public support shifts
                          4. International cooperation developments
                          5. Scientific discoveries

                          After you read the article and extracted the key points, I would like you to categorize the article into exactly one of the following categories.

                          - Cosmic Discoveries
                          - Space Technology Innovations
                          - Mars Exploration Updates
                          - Moon Exploration Updates
                          - Starship Updates
                          - Space Economy & Ventures
                          - Human Spaceflight Milestones
                          - Earth from Above
                          - Sci-Fi Becoming Reality
                          - Space Policy & Governance
                          - Citizen Space Science
                          - Deep Space Mysteries
                          - Space Sustainability
                          - Upcoming Space Events

                          Choose the category that best fits the main focus of the article. If an article touches on multiple categories, choose the most prominent one. Place the category that you choose in the <category> tags.

                          Here is the article text to analyze:

                          <article>
                          ${article.content}
                          </article>

                          Please read and analyze the article carefully. For each of the five key areas listed above, summarize any relevant information found in the article. If no information is found for a particular area, state that explicitly.

                          After summarizing the individual areas, provide a brief overall summary of the article. Avoid using phrasing like "this article summarizes..." or "this is a summary..." or "this article...". We don't need to be told it's a summary.

                          Present your findings in the following format:

                          <category>
                          Select one, and only one category from the list provided based on the content of the article.
                          </category>

                          <technological_advancements>
                          Summarize any relevant technological advancements mentioned in the article.
                          </technological_advancements>

                          <funding_changes>
                          Summarize any relevant funding changes mentioned in the article.
                          </funding_changes>

                          <public_support>
                          Summarize any relevant shifts in public support mentioned in the article.
                          </public_support>

                          <international_cooperation>
                          Summarize any relevant developments in international cooperation mentioned in the article.
                          </international_cooperation>

                          <scientific_discoveries>
                          Summarize any relevant scientific discoveries mentioned in the article.
                          </scientific_discoveries>

                          <overall_summary>
                          Provide a brief overall summary of the article. Avoid language like, "this article summarize", "this article is about", "this is a summary", etc.
                          </overall_summary>

                          Ensure that your summaries are concise and focused on information directly related to space exploration efforts. If the article contains no relevant information for a particular category or for space exploration in general, clearly state this in your response.`,
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
        metadata: [
          ...articles.map((article) => ({ articleId: article.articleId })),
        ],
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
