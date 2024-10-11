import * as cheerio from 'cheerio';
import axios from 'axios';

export async function articleScraper(
  url: string
): Promise<{ success: boolean; message: string } | null> {
  try {
    // Get the HTML of the article
    const response = await axios.get(url);

    const $ = cheerio.load(response.data);

    const article = $('article');

    if (article.length) {
      const paragraphs = article.find('p');

      const content = paragraphs
        .map((i, el) => {
          return $(el).text();
        })
        .get()
        .join(`\n`);

      return { success: true, message: content };
    } else {
      return { success: false, message: 'No article found' };
    }
  } catch (error) {
    console.error(`Error scraping article: ${error}`);
    return null;
  }
}
