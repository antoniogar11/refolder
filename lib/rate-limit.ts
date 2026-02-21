import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const hasRedisConfig =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = hasRedisConfig ? Redis.fromEnv() : null;

const upstashRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(50, "1 h"),
      prefix: "ratelimit:generate-estimate",
    })
  : null;

/** Rate-limit a key. Passes through when Redis is not configured. */
export async function ratelimit(key: string): Promise<{ success: boolean }> {
  if (!upstashRatelimit) return { success: true };
  return upstashRatelimit.limit(key);
}
