// Serverless In-Memory Sliding-Window Rate Limiter
// Enforces request throttling per IP / User identifier to protect against API quota exhaustion.

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Periodically clean up entries older than 5 minutes to prevent memory leaks in warm lambdas
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      const validTimestamps = record.timestamps.filter(ts => now - ts < 300000);
      if (validTimestamps.length === 0) {
        rateLimitStore.delete(key);
      } else {
        record.timestamps = validTimestamps;
      }
    }
  }, 60000);
}

export interface RateLimitOptions {
  maxRequests: number; // Maximum allowed requests within windowMs
  windowMs?: number;   // Window size in ms (default: 60,000ms = 1 min)
  endpointName?: string;
}

export function checkRateLimit(req: any, res: any, options: RateLimitOptions): boolean {
  const { maxRequests, windowMs = 60000, endpointName = 'API' } = options;
  const now = Date.now();

  // Extract client identifier: prioritize x-user-id header, then x-forwarded-for, then req.socket.remoteAddress
  const rawIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.socket?.remoteAddress || '127.0.0.1';
  const ip = Array.isArray(rawIp) ? rawIp[0] : rawIp.split(',')[0].trim();
  const userId = req.headers['x-user-id'] || 'anonymous';
  const key = `${endpointName}:${userId !== 'anonymous' ? userId : ip}`;

  let record = rateLimitStore.get(key);
  if (!record) {
    record = { timestamps: [] };
    rateLimitStore.set(key, record);
  }

  // Filter timestamps within current sliding window
  const windowStart = now - windowMs;
  record.timestamps = record.timestamps.filter(ts => ts > windowStart);

  const requestCount = record.timestamps.length;
  const remaining = Math.max(0, maxRequests - requestCount - 1);
  const resetTime = Math.ceil((windowStart + windowMs) / 1000);

  // Set standard RateLimit headers
  if (res && res.setHeader) {
    res.setHeader('X-RateLimit-Limit', maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', remaining.toString());
    res.setHeader('X-RateLimit-Reset', resetTime.toString());
  }

  if (requestCount >= maxRequests) {
    const retryAfterSec = Math.max(1, Math.ceil(((record.timestamps[0] + windowMs) - now) / 1000));
    if (res && res.setHeader) {
      res.setHeader('Retry-After', retryAfterSec.toString());
    }
    res.status(429).json({
      error: `Rate limit exceeded for ${endpointName}. Maximum ${maxRequests} requests per ${Math.round(windowMs / 1000)}s allowed.`,
      retryAfterSeconds: retryAfterSec
    });
    return false; // Request throttled
  }

  // Record this request
  record.timestamps.push(now);
  return true; // Request allowed
}
