import { redis } from '~/redis.server';
import { ILaunchResponse } from '~/services/launchService';

export const CACHE_DURATIONS = {
  UPCOMING_LIST: 3600, // 1 hour for upcoming launches list
  PAST_LIST: 7200, // 2 hours for past launches (less frequent updates)
  LAUNCH_DETAIL: 1800, // 30 mins for individual launch details
  AGENCY: 86400, // 24 hours for agency info
  DEFAULT: 3600, // 1 hour default
} as const;

export function getCacheDuration(url: string) {
  if (url.includes('/launches/upcoming')) {
    return CACHE_DURATIONS.UPCOMING_LIST;
  }
  if (url.includes('/launches/previous')) {
    return CACHE_DURATIONS.PAST_LIST;
  }
  if (url.match(/\/launches\/[a-zA-Z0-9-]+$/)) {
    return CACHE_DURATIONS.LAUNCH_DETAIL;
  }
  if (url.includes('/agencies')) {
    return CACHE_DURATIONS.AGENCY;
  }
  return CACHE_DURATIONS.DEFAULT;
}

export async function getCacheForURL(
  url: string
): Promise<ILaunchResponse | null> {
  if (process.env.NODE_ENV === 'development') return null;

  try {
    const cachedData = await redis.get(url);
    if (!cachedData) return null;

    return cachedData as ILaunchResponse;
  } catch (error) {
    console.error('Cache retrieval error:', error);
    return null;
  }
}
