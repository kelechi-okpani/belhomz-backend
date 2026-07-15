import Redis from "ioredis";
import { RedisPubSub } from "graphql-redis-subscriptions";
import { env } from "./env";

// Pub/sub needs its own dedicated connections, separate from the main
// `redis` client used for caching/rate-limiting/refresh tokens — a
// subscriber connection blocks and can't be reused for regular commands.
const publisher = new Redis(env.redisUrl);
const subscriber = new Redis(env.redisUrl);

export const pubsub = new RedisPubSub({ publisher, subscriber });

export const ACTIVITY_FEED_CHANNEL = "ACTIVITY_FEED";
