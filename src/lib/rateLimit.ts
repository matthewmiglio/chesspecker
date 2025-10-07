import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create Redis client
// Falls back to in-memory Map if Upstash credentials not configured
let redis: Redis;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
} else {
  console.warn('[rateLimit] Upstash Redis not configured - using in-memory fallback (not production-safe!)');
  // Use Map adapter for in-memory storage when Redis is not configured
  redis = new Map() as unknown as Redis;
}

/**
 * Rate limiter for puzzle creation endpoint
 * Limit: 10 requests per hour per user
 */
export const puzzleCreationLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 h"),
  analytics: true,
  prefix: "ratelimit:puzzle_creation",
});

/**
 * Rate limiter for daily stats endpoint
 * Limit: 100 requests per minute per IP
 */
export const dailyStatsLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 m"),
  analytics: true,
  prefix: "ratelimit:daily_stats",
});

/**
 * Rate limiter for feedback submission
 * Limit: 5 requests per minute per user
 */
export const feedbackLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true,
  prefix: "ratelimit:feedback",
});

/**
 * Rate limiter for set creation
 * Limit: 20 requests per hour per user
 */
export const setCreationLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "1 h"),
  analytics: true,
  prefix: "ratelimit:set_creation",
});

/**
 * Rate limiter for analytics events
 * Limit: 100 requests per minute per IP
 */
export const analyticsLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 m"),
  analytics: true,
  prefix: "ratelimit:analytics",
});

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
