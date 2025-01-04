import { isAxiosError, AxiosError } from 'axios';
import { getCacheDuration, getCacheForURL } from '~/lib/redis';
import { redis } from '~/redis.server';
import { IAgency, IProgram, IUpdate } from '~/services/interfaces';
import { ILaunchResult } from '~/services/launchService';
import {
  checkRateLimit,
  updateRateLimitTracking,
} from '~/services/rateLimitService';
import { launchListRequest } from '~/lib/utils';
export interface IEventResponse {
  count: number;
  next: string;
  previous: string;
  results: IEventResult[];
}

export interface IEventResult {
  id: string;
  name: string;
  next?: string;
  previous?: string;
  image: {
    image_url: string;
    name: string;
    license: { name: string; link: string };
  };
  date: string;
  slug: string;
  type: {
    id: number;
    name: string;
  };
  location: string;
  description: string;
  updates: IUpdate[];
  program: IProgram[];
  agencies: IAgency[];
  launches: ILaunchResult[];
}

export async function getEvents(
  url: string
): Promise<{ data: IEventResponse | null; error: string | null }> {
  try {
    // Add rate limiting check
    const rateLimit = await checkRateLimit();
    if (!rateLimit.canProceed) {
      const cachedData = await getCacheForURL(url);
      if (cachedData) {
        return { data: cachedData as IEventResponse, error: null };
      }
      return { data: null, error: 'Rate limit exceeded. Try again later.' };
    }

    const cachedData = await getCacheForURL(url);
    if (cachedData) {
      return { data: cachedData as IEventResponse, error: null };
    }

    const response = await launchListRequest(url);

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

export async function getEventById(url: string) {
  try {
    // Add rate limiting check
    const rateLimit = await checkRateLimit();
    if (!rateLimit.canProceed) {
      const cachedData = await getCacheForURL(url);
      if (cachedData) {
        return { data: cachedData, error: null };
      }
      return { data: null, error: 'Rate limit exceeded. Try again later.' };
    }

    const response = await launchListRequest(url);

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
          axiosError.response?.data ||
          axiosError.message ||
          'An error occurred',
      };
    }
    return { data: null, error: 'An error occurred' };
  }
}
