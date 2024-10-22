import { escapeXml, extractWeeklyContent } from '@/common/utils/regex';
import { emojiMap } from '@/common/utils/emojiMap';
import xml2js from 'xml2js';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

const articleSchema = z.object({
  title: z.string(),
  link: z.string().url(),
  source: z.string(),
  summary: z.string(),
  published_at: z.string(),
});

const categorySchema = z.object({
  name: z.string(),
  articles: z.array(articleSchema),
});

const weeklyContentSchema = z.object({
  newsletter_title: z.array(z.string()).length(1),
  weekly_summary: z.array(z.string()).length(1),
  slug: z.array(z.string()).length(1).optional(),
  newsletter: z.array(
    z.object({
      newsletter_item: z.array(
        z.object({
          category: z.array(z.string()),
          title: z.array(z.string()),
          link: z.array(z.string()),
          summary: z.array(z.string()),
          source: z.array(z.string()),
          image_url: z.array(z.string()).optional(),
          published_at: z.array(z.string()),
        })
      ),
    })
  ),
});

export const newsletterSchema = z.object({
  title: z.string(),
  summary: z.string(),
  slug: z.string(),
  generatedHTML: z.string(),
});

type NewsletterData = z.infer<typeof newsletterSchema>;
type NewsletterResult = NewsletterData | { error: string };

/**
 *
 * @param newsletter - The AI-generated newsletter content - string with XML structure
 */
export async function processNewsletterData(
  newsletter: string = sampleResponse
): Promise<NewsletterResult> {
  const xmlData = extractWeeklyContent(newsletter);

  if (!xmlData) {
    return { error: 'No weekly content found' };
  }

  const escapedXmlData = escapeXml(xmlData);

  return new Promise<NewsletterResult>((resolve) => {
    xml2js.parseString(escapedXmlData, (err, result) => {
      if (err) {
        resolve({ error: `Error parsing XML: ${err}` });
        return;
      }

      try {
        const validatedContent = weeklyContentSchema.parse(
          result.weekly_content
        );
        const processedData = processXMLData(validatedContent.newsletter[0]);

        const title = validatedContent.newsletter_title[0];
        const summary = validatedContent.weekly_summary[0];
        const slug =
          validatedContent.slug?.[0] ??
          `weekly-newsletter-${new Date().toISOString()}`;

        const generatedHTML = generateHTML(title, summary, processedData);

        const newsletterData = {
          title,
          summary,
          slug,
          generatedHTML,
        };

        const validatedNewsletterData = newsletterSchema.parse(newsletterData);
        resolve(validatedNewsletterData);
      } catch (error) {
        if (error instanceof z.ZodError) {
          resolve({
            error: `Validation error: ${error.errors.map((e) => e.message).join(', ')}`,
          });
        } else {
          resolve({ error: `Unexpected error: ${error}` });
        }
      }
    });
  });
}

export async function generateNewsletterXML(
  data: any,
  logger?: { log: (arg0: string) => void } | undefined
): Promise<string> {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const msg = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20240620',
    max_tokens: 5000,
    temperature: 0,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `You will be given two sets of data: article data and summary data. Your task is to process this information and generate structured content for a weekly newsletter and a blog post page. Here's the data you'll be working with:\n\n<article_data>\n{{${JSON.stringify(data)}}}\n</article_data>\n\nYour goal is to create consistent, structured data that can be used to fill an HTML template for both a newsletter and a blog post page. Follow these steps to process the information and generate the required content:\n\n1. Analyze the provided data:\n   - Extract the relevant information from the article data (URL, news agency)\n\n   - Review the summary data, including the AI-generated summary and category for each article\n\n2. For the newsletter content, create the following structure for each article:\n   <newsletter_item>\n   <title>[Insert catchy title based on the article content]</title>\n   <summary>[Provide a brief, engaging summary of the article in 2-3 sentences]</summary>\n   <category>[Insert the category from the summary data]</category>\n   <published_at>[Insert the published_at date for the article]</published_at>\n   <source>[Insert the news agency from the article data]</source>\n   <link>[Insert the URL from the article data]</link>\n <image_url>[If the article has an image_url, include it here]</image_url>\n   </newsletter_item>\n\n\n3. Organize the content:\n   - Group the newsletter items by category\n   - Sort the newsletter content by relevance or importance (use your judgment based on the content)\n\n4. Generate the final output in the following format:\n   <weekly_content>\n   <newsletter_title>[Insert a title for this week's newsletter]</newsletter_title>\n   <weekly_summary>[A brief summary of space new this week]</weekly_summary>\n   <slug>[Insert a slugified string to be used as an identifier for the newsletter post]</slug>\n   <newsletter>\n   [Insert all newsletter items, grouped by category]\n   </newsletter>\n   </weekly_content>\n\nEnsure that your writing style is consistent, engaging, and appropriate for a professional newsletter and blog. Use clear and concise language, and maintain a neutral tone while highlighting the importance of each article.`,
          },
        ],
      },
    ],
  });

  if (logger) {
    logger.log(JSON.stringify(msg, null, 2));
  }

  if (msg.stop_reason === 'max_tokens') {
    throw new Error('Max tokens exceeded');
  }

  if (msg.content[0].type === 'text') {
    return msg.content[0].text;
  }
  return '';
}

function processXMLData(
  xmlData: z.infer<typeof weeklyContentSchema>['newsletter'][0]
) {
  const categories: Record<string, z.infer<typeof articleSchema>[]> = {};

  xmlData.newsletter_item.forEach((item) => {
    const category = item.category[0];

    if (!categories[category]) {
      categories[category] = [];
    }

    categories[category].push({
      title: item.title[0],
      link: item.link[0],
      source: item.source[0],
      summary: item.summary[0],
      published_at: item.published_at[0],
    });
  });

  return Object.entries(categories).map(([name, articles]) =>
    categorySchema.parse({ name, articles })
  );
}

function generateHTML(
  title: string,
  summary: string,
  processedData: z.infer<typeof categorySchema>[]
) {
  return `
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <h1 style="font-size: 28px; font-weight: 700;">${title ?? 'This Week in Space Exploration'}</h1>
      ${summary ? `<p>${summary}</p><hr>` : ''}
      ${processedData
        .map(
          (category, index) => `
        <div style="display: flex; flex-direction: column; gap: 24px;">
          <h2 style="font-size: 24px; font-weight: 700; text-align: center;">${emojiMap[category.name as keyof typeof emojiMap] ? `${emojiMap[category.name as keyof typeof emojiMap]} ` : ''}${category.name}</h2>
          ${category.articles
            .map(
              (article) => `
            <div>
              <div style="display: flex; flex-direction: column; gap: 16px;">
                <h3 style="font-size: 18px; color: blue; text-decoration: underline; font-weight: 500;">
                  <a href="${article.link}">${article.title}</a>
                </h3>
                <p>${article.summary}</p>
              </div>
              <p style="margin-top: 8px; font-size: 14px;"><b>Source: </b>${article.source}</p>
            </div>
          `
            )
            .join('')}
          ${index !== processedData.length - 1 ? '<hr>' : ''}
        </div>
      `
        )
        .join('')}
    </div>
  `;
}

export const sampleResponse = `Here's the processed and structured content for the weekly newsletter:
<weekly_content>
<newsletter_title>Space Exploration Leaps Forward: Starship Success and International Cooperation</newsletter_title>
<weekly_summary>This week in space news, SpaceX achieved a major milestone with its Starship test flight, while Estonia joined the Artemis Accords, strengthening international collaboration in space exploration.</weekly_summary>
<newsletter>
<category>Space Technology Innovations</category>
<newsletter_item>
<slug>starship-success-estonia-artemis-accords-2024-10-13</slug>
<title>SpaceX's Starship Achieves Major Milestone: Booster Catch and Suborbital Flight</title>
<summary>SpaceX's fifth Starship test flight marked a significant leap in reusable rocket technology. The Super Heavy booster was successfully caught by mechanical arms after separation, while the Starship upper stage reached a suborbital altitude of 212 kilometers. This achievement brings SpaceX closer to its goal of frequent, reusable space launches.</summary>
<category>Space Technology Innovations</category>
<published_at>2024-10-13T13:08:35.000Z</published_at>
<source>SpaceNews</source>
<link>https://spacenews.com/spacex-launches-fifth-starship-catches-super-heavy-booster/</link>
</newsletter_item>
<category>Starship Updates</category>
<newsletter_item>
<title>SpaceX's Starship Test Flight: A Giant Leap Towards Mars</title>
<summary>SpaceX's fifth Starship test flight achieved multiple milestones, including the first successful catch of the Super Heavy Booster by the Mechazilla launch tower. With successful hot-staging separation and controlled Starship splashdown, CEO Elon Musk projects unmanned Mars missions within two years and crewed missions by 2028.</summary>
<category>Starship Updates</category>
<published_at>2024-10-13T13:03:03.000Z</published_at>
<source>Teslarati</source>
<link>https://www.teslarati.com/spacex-aces-fifth-starship-test-flight-successful-super-heavy-booster-catch/</link>
</newsletter_item>
<newsletter_item>
<title>SpaceX's Starship IFT-5: Booster Catch Success Paves Way for Moon and Mars Missions</title>
<summary>SpaceX's Integrated Flight Test-5 (IFT-5) achieved a major milestone by successfully catching the Super Heavy booster at the launch site in Boca Chica, Texas. This test demonstrates significant progress in developing fully reusable launch systems for future space missions, including NASA's Artemis program and potential Mars expeditions.</summary>
<category>Starship Updates</category>
<published_at>2024-10-13T12:55:42.000Z</published_at>
<source>SpacePolicyOnline.com</source>
<link>https://spacepolicyonline.com/news/spacex-catches-a-booster-a-big-one/</link>
</newsletter_item>
<category>Space Policy & Governance</category>
<newsletter_item>
<title>Estonia Joins Artemis Accords: Expanding International Collaboration in Space</title>
<summary>Estonia has become the 45th nation to sign the Artemis Accords, committing to safe and responsible space exploration. This milestone, celebrated in Milan with NASA Administrator Bill Nelson present, opens new opportunities for Estonian enterprises in the global space community and reinforces international collaboration in space exploration.</summary>
<category>Space Policy & Governance</category>
<published_at>2024-10-13T16:10:36.000Z</published_at>
<source>NASA</source>
<link>https://www.nasa.gov/news-release/nasa-welcomes-estonia-as-newest-artemis-accords-signatory/</link>
</newsletter_item>
</newsletter>
</weekly_content>`;
