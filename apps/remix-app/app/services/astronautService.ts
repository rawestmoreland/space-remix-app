import { isAxiosError, AxiosError } from 'axios';
import { getCacheDuration, getCacheForURL } from '~/lib/redis';
import { launchListRequest } from '~/lib/utils';
import { redis } from '~/redis.server';
import { ILaunchResult } from '~/services/launchService';
import {
  checkRateLimit,
  updateRateLimitTracking,
} from '~/services/rateLimitService';

export interface IAstronautResult {
  id: number;
  name: string;
  age: number;
  status: { name: string };
  in_space: boolean;
  agency: { name: string; abbrev: string };
  nationality: { name: string }[];
  date_of_birth: string;
  bio: string;
  image: { image_url: string; license: { name: string; link: string } };
  time_in_space: string;
  flights_count: number;
  landings_count: number;
  spacewalks_count: number;
  last_flight: string;
  first_flight: string;
  eva_time: string;
  flights: ILaunchResult[];
  social_media_links: { social_media: { name: string }; url: string }[];
}

export interface IAstronautResponse {
  count: number;
  next: string;
  previous: string;
  results: IAstronautResult[];
  error: string | null;
}

export interface IAstronautStatus {
  id: number;
  name: string;
}

export async function getAstronauts(
  url: string
): Promise<{ data: IAstronautResponse | null; error: string | null }> {
  try {
    // Add rate limiting check
    const rateLimit = await checkRateLimit();
    if (!rateLimit.canProceed && process.env.NODE_ENV === 'production') {
      const cachedData = await getCacheForURL(url);
      if (cachedData) {
        return { data: cachedData as IAstronautResponse, error: null };
      }
      return { data: null, error: 'Rate limit exceeded. Try again later.' };
    }

    const response = await launchListRequest(url, process.env.LL_API_KEY!);

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
          (axiosError.response?.data as string) ||
          axiosError.message ||
          'An error occurred',
      };
    }
    return { data: null, error: 'An error occurred' };
  }
}

export async function getAstronautById(
  url: string
): Promise<{ data: IAstronautResult | null; error: string | null }> {
  try {
    // Add rate limiting check
    const rateLimit = await checkRateLimit();
    if (!rateLimit.canProceed && process.env.NODE_ENV === 'production') {
      const cachedData = await getCacheForURL(url);
      if (cachedData) {
        return { data: cachedData as IAstronautResult, error: null };
      }
      return { data: null, error: 'Rate limit exceeded. Try again later.' };
    }

    const response = await launchListRequest(url, process.env.LL_API_KEY!);

    // Cache the response with appropriate duration
    const cacheDuration = getCacheDuration(url);

    if (process.env.NODE_ENV === 'production') {
      await redis.set(url, JSON.stringify(response.data));
      await redis.expire(url, cacheDuration);
    }

    // Update rate limit tracking
    if (process.env.NODE_ENV === 'production') {
      await updateRateLimitTracking();
    }

    return { data: response.data as IAstronautResult, error: null };
  } catch (error) {
    if (isAxiosError(error)) {
      const axiosError = error as AxiosError;
      return {
        data: null,
        error:
          (axiosError.response?.data as string) ||
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

    const response = await launchListRequest(url, process.env.LL_API_KEY!);

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
