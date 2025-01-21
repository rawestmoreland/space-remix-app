import { AxiosError, isAxiosError } from 'axios';
import { getCacheForURL, getCacheDuration } from '~/lib/redis';
import { launchListRequest } from '~/lib/utils';
import { redis } from '~/redis.server';
import {
  checkRateLimit,
  updateRateLimitTracking,
} from '~/services/rateLimitService';

const isProduction = process.env.NODE_ENV === 'production';

export interface ILauncherConfig {
  id: string;
  full_name: string;
  description: string;
  image: {
    credit: string;
    image_url: string;
  };
  manufacturer: {
    name: string;
    country: {
      name: string;
    }[];
    description: string;
  };
  reusable: boolean;
  families: ILauncherConfigFamily[];
  active: boolean;
  wiki_url: string;
  info_url: string;
}

export interface ILauncherConfigFamily {
  id: string;
  name: string;
}

export interface ILauncherConfigResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ILauncherConfig[];
  error: string | null;
}

export interface ILauncherConfigFamilyResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ILauncherConfigFamily[];
  error: string | null;
}

export async function getLauncherConfigs(
  url: string
): Promise<{ data: ILauncherConfigResponse | null; error: string | null }> {
  try {
    // Add rate limiting check
    const rateLimit = await checkRateLimit();
    if (!rateLimit.canProceed && isProduction) {
      const cachedData = await getCacheForURL(url);
      if (cachedData) {
        return { data: cachedData as ILauncherConfigResponse, error: null };
      }
      return { data: null, error: 'Rate limit exceeded. Try again later.' };
    }

    const cachedData = await getCacheForURL(url);
    if (cachedData) {
      return { data: cachedData as ILauncherConfigResponse, error: null };
    }

    const response = await launchListRequest(url, process.env.LL_API_KEY!);

    // Cache the response with appropriate duration
    const cacheDuration = getCacheDuration(url);
    if (isProduction) {
      await redis.set(url, JSON.stringify(response.data));
      await redis.expire(url, cacheDuration);
    }

    // Update rate limit tracking
    if (isProduction) {
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

export async function getLauncherConfigFamilies(url: string) {
  try {
    // Add rate limiting check
    const rateLimit = await checkRateLimit();
    if (!rateLimit.canProceed && isProduction) {
      const cachedData = await getCacheForURL(url);
      if (cachedData) {
        return {
          data: cachedData as ILauncherConfigFamilyResponse,
          error: null,
        };
      }
      return { data: null, error: 'Rate limit exceeded. Try again later.' };
    }

    const cachedData = await getCacheForURL(url);
    if (cachedData) {
      return { data: cachedData as ILauncherConfigFamilyResponse, error: null };
    }

    const response = await launchListRequest(url, process.env.LL_API_KEY!);

    // Cache the response with appropriate duration
    const cacheDuration = getCacheDuration(url);
    if (isProduction) {
      await redis.set(url, JSON.stringify(response.data));
      await redis.expire(url, cacheDuration);
    }

    // Update rate limit tracking
    if (isProduction) {
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
