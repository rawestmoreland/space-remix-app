import axios, { isAxiosError, AxiosError } from 'axios';
import { getCacheDuration, getCacheForURL } from '~/lib/redis';
import { redis } from '~/redis.server';
import {
  checkRateLimit,
  updateRateLimitTracking,
} from '~/services/rateLimitService';

export interface IStarshipUpdate {
  id: string;
  comment: string;
  info_url: string;
  created_by: string;
  created_on: string;
  profile_image: string;
}

export interface IStarshipLiveStream {
  title: string;
  description: string;
  image: string;
  url: string;
}

export interface IStarshipVehicle {
  id: string;
  details: string;
  serial_number: string;
  first_launch_date: string;
  launcher_config: IVehicleLauncherConfig;
  status: IVehicleStatus;
  flights: number;
  image: IImage;
}

interface IVehicleStatus {
  id: number;
  name: string;
}

interface IVehicleLauncherConfig {
  id: string;
  full_name: string;
}

interface IImage {
  image_url: string;
}

export interface IStarshipResponse {
  response_mode: 'normal' | 'list';
  updates: IStarshipUpdate[];
  live_streams: IStarshipLiveStream[];
  vehicles: IStarshipVehicle[];
}

export async function getStarshipDashboard(url: string) {
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

    const response = await axios.get(url);

    // Get cache duration
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
        error: axiosError.message || 'An error occurred',
      };
    }
    return { data: null, error: 'An error occurred' };
  }
}
