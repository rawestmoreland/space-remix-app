import { isAxiosError, AxiosError } from 'axios';
import { getCacheDuration, getCacheForURL } from '~/lib/redis';
import { launchListRequest } from '~/lib/utils';
import { redis } from '~/redis.server';
import {
  checkRateLimit,
  updateRateLimitTracking,
} from '~/services/rateLimitService';

export interface ILocationResponse {
  count: number;
  next: string;
  previous: string;
  results: ILocationResult[];
}

export interface ILocationResult {
  id: number;
  name: string;
  location: string;
  description: string;
  launches: number;
  nextLaunch: string;
  image: string;
  coordinates: string;
  total_launch_count: number;
}

export async function getLocations(
  url: string
): Promise<{ data: ILocationResponse | null; error: string | null }> {
  try {
    // Add rate limiting check
    const rateLimit = await checkRateLimit();
    if (!rateLimit.canProceed) {
      const cachedData = await getCacheForURL(url);
      if (cachedData) {
        return { data: cachedData as ILocationResponse, error: null };
      }
      return { data: null, error: 'Rate limit exceeded. Try again later.' };
    }

    const cachedData = await getCacheForURL(url);
    if (cachedData) {
      return { data: cachedData as ILocationResponse, error: null };
    }

    const response = await launchListRequest(url, process.env.LL_API_KEY!);

    // Cache the response with appropriate duration
    const cacheDuration = getCacheDuration(url);
    await redis.set(url, JSON.stringify(response.data));
    await redis.expire(url, cacheDuration);

    // Update rate limit tracking
    await updateRateLimitTracking();

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

export async function getLocation(
  id: number
): Promise<{ data: ILocationResult | null; error: string | null }> {
  const url = `${process.env.LL_BASE_URL}/locations/${id}`;
  try {
    // Add rate limiting check
    const rateLimit = await checkRateLimit();
    if (!rateLimit.canProceed) {
      const cachedData = await getCacheForURL(url);
      if (cachedData) {
        return { data: cachedData as ILocationResult, error: null };
      }
      return { data: null, error: 'Rate limit exceeded. Try again later.' };
    }

    const response = await launchListRequest(url, process.env.LL_API_KEY!);

    // Cache the response with appropriate duration
    const cacheDuration = getCacheDuration(url);

    await redis.set(url, JSON.stringify(response.data));
    await redis.expire(url, cacheDuration);

    // Update rate limit tracking
    await updateRateLimitTracking();

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
