import { Redis } from '@upstash/redis';
declare global {
  // eslint-disable-next-line no-var
  var __redis: Redis;
}
if (!global.__redis) {
  global.__redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}
export const redis = global.__redis;
