import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const hasRedisConfig =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = hasRedisConfig ? Redis.fromEnv() : null;

const upstashRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "1 h"),
      prefix: "ratelimit:generate-estimate",
    })
  : null;

const isProduction = process.env.NODE_ENV === "production";

/** Rate-limit a key. In production, blocks if Redis is not configured. In dev, passes through. */
export async function ratelimit(key: string): Promise<{ success: boolean }> {
  if (!upstashRatelimit) {
    if (isProduction) {
      console.error("Rate limiting not configured in production — blocking request.");
      return { success: false };
    }
    return { success: true };
  }
  return upstashRatelimit.limit(key);
}
