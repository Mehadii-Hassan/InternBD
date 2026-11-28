"use server";

// Simple in-memory rate limiter
// In production, replace with Redis-backed rate limiter for multi-instance support

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

const RATE_LIMIT_POINTS = 10; // requests per window
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

export async function rateLimit(ip: string): Promise<{ allowed: boolean; remaining: number }> {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_POINTS - 1 };
  }

  if (entry.count >= RATE_LIMIT_POINTS) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT_POINTS - entry.count };
}

export async function withRateLimit<T>(
  ip: string,
  action: () => Promise<T>
): Promise<T | { error: string }> {
  const result = await rateLimit(ip);
  if (!result.allowed) {
    return { error: "Too many requests. Please try again later." } as unknown as T;
  }
  return action();
}
