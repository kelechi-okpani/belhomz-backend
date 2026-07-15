import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redis } from "../../config/redis";
import { env } from "../../config/env";

function sendCommand(...args: string[]): Promise<any> {
  return (redis.call as (...a: string[]) => Promise<any>)(...args);
}

// General API rate limiter — applied to all routes
export const generalLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
  store: new RedisStore({
    sendCommand,
    prefix: "rl:general:",
  }),
});

// Stricter limiter for auth endpoints — protects against brute-force login attempts
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many auth attempts, please try again later." },
  store: new RedisStore({
    sendCommand,
    prefix: "rl:auth:",
  }),
});
