import { redis } from '~/redis.server';
import {
  IAstronautResult,
  IAstronautResponse,
} from '~/services/astronautService';
import { IEventResponse } from '~/services/eventsService';
import {
  ILauncherConfigFamilyResponse,
  ILauncherConfigResponse,
} from '~/services/launcherService';
import { ILaunchResponse, ILaunchResult } from '~/services/launchService';
import { ILocationResponse, ILocationResult } from '~/services/locationService';

export const CACHE_DURATIONS = {
  UPCOMING_LIST: 3600, // 1 hour for upcoming launches list
  PAST_LIST: 7200, // 2 hours for past launches (less frequent updates)
  LAUNCH_DETAIL: 1800, // 30 mins for individual launch details
  AGENCY: 86400, // 24 hours for agency info
  DEFAULT: 3600, // 1 hour default
  CONFIG: 2592000, // 30 days for config
  LOCATION: 86400, // 24 hours for location info
  ASTRONAUTS: 2592000, // 30 days for astronauts info
  LAUNCHER_CONFIG_FAMILIES: 604800, // 1 week for launcher config families
} as const;

export function getCacheDuration(url: string) {
  if (url.includes('/config')) {
    return CACHE_DURATIONS.CONFIG;
  }
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
  if (url.includes('/locations')) {
    return CACHE_DURATIONS.LOCATION;
  }
  if (url.includes('/astronauts')) {
    return CACHE_DURATIONS.ASTRONAUTS;
  }
  if (url.includes('/launcher_configuration_families')) {
    return CACHE_DURATIONS.LAUNCHER_CONFIG_FAMILIES;
  }
  return CACHE_DURATIONS.DEFAULT;
}

type CacheableResponse =
  | ILaunchResponse
  | IEventResponse
  | ILocationResponse
  | IAstronautResponse
  | IAstronautResult
  | ILauncherConfigResponse
  | ILauncherConfigFamilyResponse
  | ILaunchResult
  | ILocationResult
  | null;
export async function getCacheForURL(url: string): Promise<CacheableResponse> {
  if (process.env.NODE_ENV === 'development') return null;

  try {
    const cachedData = await redis.get(url);
    if (!cachedData) return null;

    return cachedData as CacheableResponse;
  } catch (error) {
    console.error('Cache retrieval error:', error);
    return null;
  }
}
