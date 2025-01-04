import axios, { isAxiosError, AxiosError } from 'axios';
import { getCacheDuration, getCacheForURL } from '~/lib/redis';
import { redis } from '~/redis.server';
import {
  checkRateLimit,
  updateRateLimitTracking,
} from '~/services/rateLimitService';

export interface IAstronaut {
  id: number;
  name: string;
  age: number;
  status: { name: string };
  in_space: boolean;
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

export interface IAstronautStatus {
  id: number;
  name: string;
}

export async function getAstronauts(url: string) {
  try {
    // Add rate limiting check
    const rateLimit = await checkRateLimit();
    if (!rateLimit.canProceed && process.env.NODE_ENV === 'production') {
      const cachedData = await getCacheForURL(url);
      if (cachedData) {
        return { data: cachedData, error: null };
      }
      return { data: null, error: 'Rate limit exceeded. Try again later.' };
    }

    const response = await axios.get(url);

    // Get cache duration
    const cacheDuration = getCacheDuration(url);

    if (process.env.NODE_ENV === 'production') {
      await redis.set(url, JSON.stringify(response.data));
      await redis.expire(url, cacheDuration);
    }

    // Update rate limit tracking
    if (process.env.NODE_ENV === 'production') {
      await updateRateLimitTracking();
    }

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

export async function getAstronautStatuses(url: string) {
  try {
    const rateLimit = await checkRateLimit();
    if (!rateLimit.canProceed && process.env.NODE_ENV === 'production') {
      return { data: null, error: 'Rate limit exceeded. Try again later.' };
    }

    const response = await axios.get(url);

    const cacheDuration = getCacheDuration(url);
    if (process.env.NODE_ENV === 'production') {
      await redis.set(url, JSON.stringify(response.data));
      await redis.expire(url, cacheDuration);
    }

    if (process.env.NODE_ENV === 'production') {
      await updateRateLimitTracking();
    }

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
