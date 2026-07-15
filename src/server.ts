import { createApp } from "./app";
import { connectDatabase, disconnectDatabase } from "./database/connection";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { redis } from "./config/redis";
import http from "node:http";
import { schema } from "./shared/graphql/schema";
import { buildWsContext } from "./shared/graphql/wsContext";
import { WebSocketServer } from "ws";
import { useServer } from 'graphql-ws/use/ws';

async function bootstrap() {
  await connectDatabase();

  const app = await createApp();
  const httpServer = http.createServer(app);

  // GraphQL Subscriptions over WebSockets
  const wsServer = new WebSocketServer({ server: httpServer, path: "/graphql" });

  const serverCleanup = useServer(
    {
      schema,
      context: (ctx: { connectionParams: any; }) => buildWsContext(ctx.connectionParams ?? {}),
    },
    wsServer
  );

  httpServer.listen(env.port, () => {
    logger.info(`RESOS API listening on port ${env.port} [${env.nodeEnv}]`);
    logger.info(`GraphQL endpoint (queries/mutations): http://localhost:${env.port}/graphql`);
    logger.info(`GraphQL subscriptions (live feed):     ws://localhost:${env.port}/graphql`);
  });

  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}, shutting down gracefully...`);
    await serverCleanup.dispose();
    httpServer.close(async () => {
      await disconnectDatabase();
      redis?.disconnect();
      logger.info("Shutdown complete");
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  process.on("unhandledRejection", (reason) => {
    logger.error(`Unhandled rejection: ${reason}`);
  });

  process.on("uncaughtException", (err) => {
    logger.error(`Uncaught exception: ${err.stack ?? err.message}`);
    process.exit(1);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});