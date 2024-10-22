import { redis } from '~/redis.server';
import { ILaunchResponse } from '~/services/launchService';

export async function getCacheForURL(
  url: string
): Promise<ILaunchResponse | null> {
  if (process.env.NODE_ENV === 'development') return null;
  const cachedData: ILaunchResponse | null = await redis.get(url);

  if (!cachedData) {
    return null;
  }

  return cachedData;
}
