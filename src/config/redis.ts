// import Redis from "ioredis";
// import { env } from "./env";
// import { logger } from "./logger";

// export let redis: Redis | null = null;

// if (env.redisUrl) {
//   redis = new Redis(env.redisUrl, {
//     maxRetriesPerRequest: 3,
//     retryStrategy(times) {
//       if (times > 5) return null;
//       return Math.min(times * 500, 3000);
//     },
//   });

//   redis.on("connect", () => logger.info("Redis connected"));
//   redis.on("ready", () => logger.info("Redis ready"));
//   redis.on("error", err => logger.error(err.message));
// } else {
//   logger.warn("REDIS_URL not configured. Redis disabled.");
// }



import Redis from "ioredis";
import { env } from "./env";
import { logger } from "./logger";

export const redis = new Redis(env.redisUrl, {
  maxRetriesPerRequest: 3,
  lazyConnect: false,
});

redis.on("connect", () => logger.info("Redis connected"));
redis.on("error", (err) => logger.error(`Redis error: ${err.message}`));
