import "server-only";

// ==============================================
// RATE LIMITER
// Production'da Upstash Redis kullanılmalı
// ==============================================

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory store (development/fallback için)
const memoryStore = new Map<string, RateLimitRecord>();

// Upstash Redis varsa kullan
const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const useRedis = !!(UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN);

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  keyPrefix?: string; // Redis key prefix
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

async function redisIncr(key: string, windowMs: number): Promise<number> {
  if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
    throw new Error("Redis not configured");
  }

  const ttlSeconds = Math.ceil(windowMs / 1000);

  // INCR + EXPIRE in a pipeline
  const response = await fetch(`${UPSTASH_REDIS_REST_URL}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      ["INCR", key],
      ["EXPIRE", key, ttlSeconds, "NX"], // NX = only set if not exists
    ]),
  });

  if (!response.ok) {
    throw new Error(`Redis error: ${response.status}`);
  }

  const result = await response.json();
  return result[0].result as number;
}

async function memoryIncr(key: string, windowMs: number): Promise<number> {
  const now = Date.now();
  const record = memoryStore.get(key);

  if (!record || now > record.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return 1;
  }

  record.count++;
  return record.count;
}

export async function rateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const {
    windowMs = 60 * 1000,
    maxRequests = 10,
    keyPrefix = "ratelimit",
  } = config;

  const key = `${keyPrefix}:${identifier}`;
  const now = Date.now();

  try {
    let count: number;

    if (useRedis) {
      count = await redisIncr(key, windowMs);
    } else {
      count = await memoryIncr(key, windowMs);
    }

    const remaining = Math.max(0, maxRequests - count);
    const resetAt = now + windowMs;

    return {
      success: count <= maxRequests,
      remaining,
      resetAt,
    };
  } catch (error) {
    console.error("Rate limit error:", error);
    // Fail open - hata durumunda izin ver
    return {
      success: true,
      remaining: maxRequests,
      resetAt: now + windowMs,
    };
  }
}

// Preset configurations
export const rateLimitPresets = {
  // Lead form: dakikada 5 istek
  leadForm: {
    windowMs: 60 * 1000,
    maxRequests: 5,
    keyPrefix: "ratelimit:lead",
  },
  // API genel: dakikada 60 istek
  apiGeneral: {
    windowMs: 60 * 1000,
    maxRequests: 60,
    keyPrefix: "ratelimit:api",
  },
  // Auth: dakikada 10 istek
  auth: {
    windowMs: 60 * 1000,
    maxRequests: 10,
    keyPrefix: "ratelimit:auth",
  },
  // Strict: dakikada 3 istek (abuse protection)
  strict: {
    windowMs: 60 * 1000,
    maxRequests: 3,
    keyPrefix: "ratelimit:strict",
  },
  // Email: saatte 10 email per user (spam protection)
  email: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    keyPrefix: "ratelimit:email",
  },
};

// Helper: IP'den identifier oluştur
export function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  return "unknown";
}

// Cleanup for memory store (her 5 dakikada bir çalıştır)
if (!useRedis) {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of memoryStore.entries()) {
      if (now > record.resetAt) {
        memoryStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}
