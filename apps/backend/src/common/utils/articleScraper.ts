import * as cheerio from 'cheerio';
import axios, { AxiosError, isAxiosError } from 'axios';

export async function articleScraper(
  url: string
): Promise<{ success: boolean; message: string; status?: number } | null> {
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

      return { success: true, message: content, status: 200 };
    } else {
      return { success: false, message: 'No article found', status: 200 };
    }
  } catch (error) {
    console.error(`Error scraping article at ${url}: ${error}`);
    if (isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        return { success: false, message: 'Article not found', status: 404 };
      }
    }
    return { success: false, message: 'An error occurred' };
  }
}
