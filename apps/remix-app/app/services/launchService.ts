import { isAxiosError, AxiosError } from 'axios';
import { getCacheDuration, getCacheForURL } from '~/lib/redis';
import { launchListRequest } from '~/lib/utils';
import { redis } from '~/redis.server';
import {
  checkRateLimit,
  updateRateLimitTracking,
} from '~/services/rateLimitService';

export interface ILaunchStatus {
  id: number;
  name: string;
  description: string;
  abbrev: string;
}

export interface ICelestialBody {
  id: number;
  name: string;
}

export interface IOrbit {
  id: number;
  name: string;
  abbrev: string;
  celestial_body: ICelestialBody;
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
  probability?: number;
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
    orbit?: IOrbit;
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
    license: { name: string; link: string };
  };
}

const isProduction = process.env.NODE_ENV === 'production';

export async function getLaunches(
  url: string
): Promise<{ data: ILaunchResponse | null; error: string | null }> {
  try {
    // Add rate limiting check
    const rateLimit = await checkRateLimit();
    if (!rateLimit.canProceed && isProduction) {
      const cachedData = await getCacheForURL(url);
      if (cachedData) {
        return { data: cachedData as ILaunchResponse, error: null };
      }
      return { data: null, error: 'Rate limit exceeded. Try again later.' };
    }

    const cachedData = await getCacheForURL(url);
    if (cachedData) {
      return { data: cachedData as ILaunchResponse, error: null };
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

export async function getLaunchById(url: string) {
  try {
    // Add rate limiting check
    const rateLimit = await checkRateLimit();
    if (!rateLimit.canProceed && isProduction) {
      const cachedData = await getCacheForURL(url);
      if (cachedData) {
        return { data: cachedData, error: null };
      }
      return { data: null, error: 'Rate limit exceeded. Try again later.' };
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
          axiosError.response?.data ||
          axiosError.message ||
          'An error occurred',
      };
    }
    return { data: null, error: 'An error occurred' };
  }
}

export async function getLastYearSuccessRate() {
  // Check if the rate is already cached
  if (isProduction) {
    const cachedRate = await redis.get('lastYearSuccessRate');

    if (cachedRate) {
      return cachedRate;
    }
  }

  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1);

  // Format dates for API
  const startDateStr = startDate.toISOString();
  const endDateStr = endDate.toISOString();

  // First, get total count
  const countUrl = `${process.env.LL_BASE_URL}/launches/?limit=1&net__gte=${startDateStr}&net__lte=${endDateStr}`;
  const { data: initialData, error: initialError } =
    await getLaunches(countUrl);

  if (initialError || !initialData) {
    throw new Error(initialError || 'Failed to fetch initial launch data');
  }

  const totalLaunches = initialData.count;
  const batchSize = 100;
  const numberOfRequests = Math.ceil(totalLaunches / batchSize);

  let allLaunches: ILaunchResult[] = [];

  // Fetch all launches
  const requests = Array.from({ length: numberOfRequests }, (_, i) => {
    const offset = i * batchSize;
    const url = `${process.env.LL_BASE_URL}/launches/?limit=${batchSize}&offset=${offset}&net__gte=${startDateStr}&net__lte=${endDateStr}&ordering=net`;
    return getLaunches(url);
  });

  const results = await Promise.all(requests);

  allLaunches = results.reduce((acc, { data, error }) => {
    if (error || !data) {
      console.error('Error fetching batch:', error);
      return acc;
    }
    return [...acc, ...data.results];
  }, [] as ILaunchResult[]);

  // If we didn't get any launches, throw an error
  if (allLaunches.length === 0) {
    throw new Error('No launch data available');
  }

  // Calculate success rate
  const successfulLaunches = allLaunches.filter(
    (launch) => launch.status.name === 'Launch Successful'
  ).length;

  // Cache the rate in redis for 24 hours
  await redis.set(
    'lastYearSuccessRate',
    JSON.stringify({
      total: allLaunches.length,
      successful: successfulLaunches,
      rate: ((successfulLaunches / allLaunches.length) * 100).toFixed(1),
    })
  );
  await redis.expire('lastYearSuccessRate', 60 * 60 * 24);

  return {
    total: allLaunches.length,
    successful: successfulLaunches,
    rate: ((successfulLaunches / allLaunches.length) * 100).toFixed(1),
  };
}

export async function getLaunchStatuses() {
  const url = `${process.env.LL_BASE_URL}/config/launch_statuses`;
  try {
    const cachedData = await redis.get(url);

    if (cachedData) {
      return { data: cachedData, error: null };
    }

    const response = await launchListRequest(url, process.env.LL_API_KEY!);
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
