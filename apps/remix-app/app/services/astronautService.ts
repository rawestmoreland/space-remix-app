import axios, { isAxiosError, AxiosError } from 'axios';
import { getCacheForURL } from '~/lib/redis';
import { redis } from '~/redis.server';

export interface IAstronaut {
  id: number;
  name: string;
  age: number;
  status: { name: string };
  agency: { name: string; abbrev: string };
  nationality: { name: string }[];
  date_of_birth: string;
  bio: string;
  image: { image_url: string };
  time_in_space: string;
  flights_count: number;
  landings_count: number;
  spacewalks_count: number;
  last_flight: string;
  first_flight: string;
  eva_time: string;
  social_media_links: { social_media: { name: string }; url: string }[];
}

export async function getAstronauts(url: string) {
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
