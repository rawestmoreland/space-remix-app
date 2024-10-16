import { escapeXml, extractWeeklyContent } from '@/common/utils/regex';
import xml2js from 'xml2js';

function processXMLData(xmlData: {
  newsletter_item: {
    category: string[];
    title: string[];
    link: string[];
    summary: string[];
    source: string[];
    published_at: string[];
  }[];
}) {
  const categories: Record<string, any> = {};

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

  return Object.entries(categories).map(([name, articles]) => ({
    name,
    articles,
  }));
}

/**
 *
 * @param newsletter - The AI-generated newsletter content - string with XML structure
 */
export function processNewsletterData(
  newsletter: string | undefined = sampleResponse
) {
  // Get rid of the "non-whitespace" characters at the beginning and end of the string
  let xmlData = extractWeeklyContent(newsletter);

  if (xmlData) {
    // Escape the XML content to avoid parsing errors
    xmlData = escapeXml(xmlData);

    // Parse the XML content
    xml2js.parseString(xmlData, (err, result) => {
      if (err) {
        console.error(`Error parsing XML: ${err}`);
        return;
      }

      const processedData = processXMLData(result.weekly_content.newsletter[0]);

      const title = result.weekly_content.newsletter_title[0];
      const summary = result.weekly_content.weekly_summary[0];
      const slug =
        result.weekly_content?.slug?.[0] ??
        `weekly-newsletter-${new Date().toISOString()}`;

      const generatedHTML = `
        <div style="display: flex; flex-direction: column; gap: 24px;"><h1 style="font-size: 28px; font-weight: 700;">${title ?? 'This Week in Space Exploration'}</h1>${summary && `<p>${result.weekly_content.weekly_summary[0]}</p><hr>`}${processedData
          .map(
            (category, index: number) =>
              `<div style="display: flex; flex-direction: column; gap: 24px;"><h2 style="font-size: 24px; font-weight: 700;">${category.name}</h2>${category.articles
                .map(
                  (article: any) =>
                    `<div><div style="display: flex; flex-direction: column; gap: 16px;"><h3 style="font-size: 18px; color: blue; text-decoration: underline; font-weight: 500;"><a href="${article.link}">${article.title}</a></h3><p>${article.summary}</p></div><p style="margin-top: 8px; font-size: 14px;"><b>Source: </b>${article.source}</p></div>`
                )
                .join(
                  ''
                )}${index !== processedData?.length - 1 ? '<hr>' : ''}</div>`
          )
          .join('')}</div>`;
    });
  } else {
    console.error('No valid XML content found in the AI response');
  }
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
