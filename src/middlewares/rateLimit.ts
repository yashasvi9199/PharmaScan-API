// src/middlewares/rateLimit.ts
// Simple in-memory rate limiting middleware

import { Request, Response, NextFunction } from "express";

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string;
}

interface RequestRecord {
  count: number;
  resetTime: number;
}

const requestCounts = new Map<string, RequestRecord>();

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of requestCounts.entries()) {
    if (now > record.resetTime) {
      requestCounts.delete(key);
    }
  }
}, 60000); // Clean every minute

/**
 * Create a rate limiting middleware
 */
export function rateLimit(options: RateLimitOptions) {
  const { windowMs, maxRequests, message = "Too many requests, please try again later" } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const key = getClientKey(req);
    const now = Date.now();
    
    let record = requestCounts.get(key);
    
    if (!record || now > record.resetTime) {
      record = { count: 0, resetTime: now + windowMs };
      requestCounts.set(key, record);
    }
    
    record.count++;
    
    // Set rate limit headers
    res.setHeader("X-RateLimit-Limit", maxRequests);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, maxRequests - record.count));
    res.setHeader("X-RateLimit-Reset", Math.ceil(record.resetTime / 1000));
    
    if (record.count > maxRequests) {
      res.status(429).json({
        success: false,
        error: message,
        retryAfter: Math.ceil((record.resetTime - now) / 1000),
      });
      return;
    }
    
    next();
  };
}

function getClientKey(req: Request): string {
  // Use X-Forwarded-For for proxied requests, fallback to IP
  const forwarded = req.headers["x-forwarded-for"];
  const ip = Array.isArray(forwarded) 
    ? forwarded[0] 
    : forwarded?.split(",")[0]?.trim() || req.ip || "unknown";
  return `${ip}:${req.path}`;
}

// Pre-configured rate limiters
export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60,
});

export const scanRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10,
  message: "Too many scan requests. Please wait before scanning again.",
});
