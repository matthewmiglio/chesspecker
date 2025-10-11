import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Check if Redis is configured
const isRedisConfigured = !!(
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
);

// Create Redis client
let redis: Redis | undefined;

if (isRedisConfigured) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
} else {
  console.warn('[rateLimit] Upstash Redis not configured - rate limiting disabled (not production-safe!)');
}

/**
 * Rate limiter for puzzle creation endpoint
 * Limit: 10 requests per hour per user
 */
export const puzzleCreationLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "1 h"),
      analytics: true,
      prefix: "ratelimit:puzzle_creation",
    })
  : null;

/**
 * Rate limiter for daily stats endpoint
 * Limit: 100 requests per minute per IP
 */
export const dailyStatsLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, "1 m"),
      analytics: true,
      prefix: "ratelimit:daily_stats",
    })
  : null;

/**
 * Rate limiter for feedback submission
 * Limit: 5 requests per minute per user
 */
export const feedbackLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 m"),
      analytics: true,
      prefix: "ratelimit:feedback",
    })
  : null;

/**
 * Rate limiter for set creation
 * Limit: 20 requests per hour per user
 */
export const setCreationLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "1 h"),
      analytics: true,
      prefix: "ratelimit:set_creation",
    })
  : null;

/**
 * Rate limiter for analytics events
 * Limit: 100 requests per minute per IP
 */
export const analyticsLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, "1 m"),
      analytics: true,
      prefix: "ratelimit:analytics",
    })
  : null;

/**
 * Helper function to get client identifier (IP address)
 * Falls back to "unknown" if IP cannot be determined
 */
export function getClientIdentifier(request: Request): string {
  // Try to get IP from headers (Vercel, Cloudflare, etc.)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  return 'unknown';
}
