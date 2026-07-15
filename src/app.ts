// src/app.ts (or your path to createApp)
import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { env } from "./config/env";
import { schema } from "./shared/graphql/schema";
import { buildContext } from "./shared/graphql/context";
import { generalLimiter } from "./shared/middlewares/rateLimiter";
import { sanitizeInput } from "./shared/middlewares/sanitize";
import { errorHandler, notFoundHandler } from "./shared/middlewares/errorHandler";
import { propertyRoutes } from "./modules/properties/routes/property.routes";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { leadRoutes } from "./modules/leads/routes/lead.routes";
import { authRoutes } from "./modules/auth/routes/auth.routes";
import { userRoutes } from "./modules/users/routes/user.routes";
import { paymentRoutes } from "./modules/payments/routes/payment.routes";
import { formatGraphQLError } from "./shared/utils/Formaterror";
import { InstagramPost } from "./modules/instagram/models/instagram-post.model";
import { syncApifyInstagramFeed } from "./modules/instagram/instagram-sync";

// 1. Import dependencies for the seed checks
import { userRepository } from "./modules/users/repositories/user.repository";
import { UserRole } from "./modules/users/interfaces/user.interface";
import { logger } from "./config/logger";

export async function createApp(): Promise<Express> {
  const app = express();
  
  // 2. Run the database seed check silently in the background
  (async () => {
    const email = process.env.OWNER_EMAIL ?? "ceo@belhomz.com";
    const name = process.env.OWNER_NAME ?? "System Administrator";
    const password = process.env.OWNER_PASSWORD ?? "ceoPassword123";

    try {
      const existing = await userRepository.findByEmail(email);
      if (!existing) {
        await userRepository.create({
          name,
          email,
          password,
          role: UserRole.OWNER,
        } as any);
        logger.info(`[SEED] Default owner account initialized: ${email}`);
      }
    } catch (err: any) {
      logger.error(`[SEED] Auto-seed background error: ${err.message}`);
    }
  })();

  // Core middleware
  app.use(
    helmet({
      contentSecurityPolicy: process.env.NODE_ENV === "production" ? undefined : false,
      crossOriginEmbedderPolicy: process.env.NODE_ENV === "production" ? undefined : false,
    })
  );

  app.use(
    cors({
      origin: (origin, callback) => {
        const developmentOrigins = [
          "http://localhost:9000", 
          "http://localhost:3000", 
          "https://sandbox.embed.apollographql.com", 
          "https://embed.apollo.io",
          "**.cdninstagram.com", "**.fbcdn.net", "proxy.apify.com"
        ];

        if (process.env.CLIENT_URL) {
          developmentOrigins.push(process.env.CLIENT_URL);
        }

        const allowedOrigins = process.env.NODE_ENV === "production"
          ? [process.env.CLIENT_URL].filter(Boolean) as string[]
          : developmentOrigins;

        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`CORS policy blocked access from origin: ${origin}`));
        }
      },
      credentials: true,
    })
  );

  app.use(hpp());
  app.use(express.json({ limit: "2mb" }));
  app.use(sanitizeInput);
  app.use(generalLimiter);
  
  // Health check
  app.get("/health", (_req, res) => {
    res.status(200).json({ success: true, message: "RESOS API is running" });
  });
  
  // REST routes
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/leads", leadRoutes);
  app.use("/api/payments", paymentRoutes);
  app.use("/api/properties", propertyRoutes);

  app.get('/api/instagram-feed', async (req: Request, res: Response): Promise<void> => {
    try {
      const feed = await InstagramPost.find().sort({ timestamp: -1 }).limit(12);
      res.status(200).json(feed);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve feed records' });
    }
  });

  app.post('/api/sync-feed', (req: Request, res: Response): void => {
    syncApifyInstagramFeed();
    res.status(202).json({ 
      message: 'Apify scraper job successfully dispatched to background loop.' 
    });
  });
  
  // Apollo GraphQL Server
  const apolloServer = new ApolloServer({ 
    schema,
    formatError: formatGraphQLError,
    plugins: [
      ApolloServerPluginLandingPageLocalDefault({
        embed: true,        
        includeCookies: true 
      })
    ],
  });

  await apolloServer.start();
  
  app.get("/", (_req, res) => {
  res.json({
    success: true,
    service: "Belhomz API",
    status: "Running",
  });
});

  app.use(
    "/graphql",
    express.json(),
    expressMiddleware(apolloServer as any, {
      context: buildContext,
    })
  );
  
  app.use(notFoundHandler);
  app.use(errorHandler);
  
  return app;
}
