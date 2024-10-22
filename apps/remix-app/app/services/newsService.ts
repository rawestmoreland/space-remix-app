import type { AxiosError } from 'axios';
import axios, { isAxiosError } from 'axios';
import { getCacheForURL } from '~/lib/redis';
import { redis } from '~/redis.server';

export interface IArticle {
  id: number;
  title: string;
  isFeatured: boolean;
  news_site: string;
  published_at: string;
  summary: string;
  image_url: string;
  url: string;
}

export async function getArticles(url: string) {
  try {
    const cachedData = await getCacheForURL(url);

    if (cachedData) {
      return { data: cachedData, error: null };
    }

    const response = await axios.get(url);
    await redis.set(url, JSON.stringify(response.data));
    await redis.expire(url, 3600); // 1 hour
    return { data: response.data, error: null };
  } catch (error) {
    if (isAxiosError(error)) {
      const axiosError = error as AxiosError;
      return {
        data: null,
        error:
          axiosError.response?.data ||
          axiosError.message ||
          'An error occurred',
      };
    }
    return { data: null, error: 'An error occurred' };
  }
}
