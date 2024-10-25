import { redis } from '~/redis.server';

interface RateLimitStatus {
  canProceed: boolean;
  remainingCalls: number;
}

export async function checkRateLimit(): Promise<RateLimitStatus> {
  if (process.env.NODE_ENV === 'development') {
    return { canProceed: true, remainingCalls: 15 };
  }

  const key = 'api_calls_count';
  const timeWindow = 3600; // 1 hour in seconds

  try {
    const count = await redis.get(key);
    if (!count) {
      // If no count exists, start fresh with the time window
      await redis.set(key, '0');
      await redis.expire(key, timeWindow);
      return { canProceed: true, remainingCalls: 15 };
    }

    const callCount = parseInt(count.toString() || '0', 10);
    if (callCount >= 15) {
      // Free tier limit
      return { canProceed: false, remainingCalls: 0 };
    }

    return {
      canProceed: true,
      remainingCalls: 15 - callCount,
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    return { canProceed: true, remainingCalls: 1 };
  }
}

export async function updateRateLimitTracking(): Promise<void> {
  if (process.env.NODE_ENV === 'development') return;

  const key = 'api_calls_count';
  const timeWindow = 3600; // 1 hour in seconds

  try {
    const count = await redis.get(key);
    if (!count) {
      await redis.set(key, '1');
      await redis.expire(key, timeWindow);
    } else {
      await redis.incr(key);
      // Ensure the expiry is still set
      await redis.expire(key, timeWindow);
    }
  } catch (error) {
    console.error('Rate limit tracking error:', error);
  }
}
