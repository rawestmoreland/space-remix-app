import axios, { isAxiosError, AxiosError } from 'axios';
import { getCacheForURL } from '~/lib/redis';
import { redis } from '~/redis.server';

export interface ILaunchStatus {
  id: number;
  name: string;
  description: string;
  abbrev: string;
}

export interface ILaunchResponse {
  count: number;
  next: string;
  previous: string;
  results: ILaunchResult[];
}

export interface IUpdate {
  id: string;
  comment: string;
  profile_image: string;
  created_by: string;
  created_on: string;
}

export interface ILaunchResult {
  id: string;
  name: string;
  next?: string;
  previous?: string;
  program: { name: string }[];
  rocket: {
    configuration: {
      name: string;
      full_name: string;
      manufacturer: {
        name: string;
      };
      leo_capacity: number;
      length: number;
      diameter: number;
    };
  };
  status: ILaunchStatus;
  net: string;
  launch_service_provider: {
    name: string;
    abbrev: string;
  };
  mission: {
    name: string;
    type: string;
    description: string;
    agencies: {
      id: string;
      name: string;
    }[];
  };
  updates: IUpdate[];
  webcast_live: boolean;
  pad: {
    name: string;
    location: {
      name: string;
    };
  };

  image: {
    image_url: string;
  };
}

export async function getLaunches(
  url: string
): Promise<{ data: ILaunchResponse | null; error: string | null }> {
  try {
    const cachedData: ILaunchResponse | null = await getCacheForURL(url);

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
          (axiosError.response?.data as string) ||
          axiosError.message ||
          'An error occurred',
      };
    }
    return { data: null, error: 'An error occurred' };
  }
}

export async function getLaunchById(url: string) {
  try {
    const cachedData = await redis.get(url);

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

export async function getLaunchStatuses() {
  const url = `${process.env.LL_BASE_URL}/config/launch_statuses`;
  try {
    const cachedData = await redis.get(url);

    if (cachedData) {
      return { data: cachedData, error: null };
    }

    const response = await axios.get(url);
    await redis.set(url, JSON.stringify(response.data));
    await redis.expire(url, 60 * 60 * 24 * 7); // 7 days
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
