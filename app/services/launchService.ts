import axios, { isAxiosError, AxiosError } from 'axios';
import { redis } from '~/redis.server';

export interface ILaunch {
  id: string;
  name: string;
  next?: string;
  previous?: string;
  rocket: {
    configuration: {
      name: string;
      full_name: string;
    };
  };
  status: {
    name: string;
    abbrev: string;
    description: string;
  };
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

export async function getLaunches(url: string) {
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
