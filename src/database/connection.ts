// src/database/connection.ts (or your path to this file)
import mongoose from "mongoose";
import { env } from "../config/env";
import { logger } from "../config/logger";
import { syncApifyInstagramFeed } from "../modules/instagram/instagram-sync";
import { userRepository } from "../modules/users/repositories/user.repository";
import { UserRole } from "../modules/users/interfaces/user.interface";

// 1. Define a quiet seed runner that won't disrupt database connection flows
async function ensureDefaultOwnerExists(): Promise<void> {
  const email = process.env.OWNER_EMAIL ?? "ceo@belhomz.com";
  const name = process.env.OWNER_NAME ?? "System Administrator";
  const password = process.env.OWNER_PASSWORD ?? "ceoPassword123";

  try {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      logger.info(`Owner verification: Account already exists for ${email}.`);
      return;
    }

    await userRepository.create({
      name,
      email,
      password,
      role: UserRole.OWNER,
    } as any);

    logger.info(`------------------------------------------------------------------`);
    logger.info(`[SEED] Default owner account created successfully: ${email}`);
    logger.info(`------------------------------------------------------------------`);
  } catch (error: any) {
    logger.error(`[SEED] Failed to verify/seed default owner account: ${error.message}`);
  }
}

interface ConnectionOptions {
  skipSync?: boolean;
}

export async function connectDatabase(options: ConnectionOptions = {}): Promise<void> {
  mongoose.set("strictQuery", true);

  mongoose.connection.removeAllListeners("connected");
  mongoose.connection.removeAllListeners("error");
  mongoose.connection.removeAllListeners("disconnected");

  mongoose.connection.on("connected", async () => {
    logger.info("MongoDB connected");

    // 2. Automatically seed the owner right after connection is active
    await ensureDefaultOwnerExists();

    if (!options.skipSync) {
      syncApifyInstagramFeed();
    }
  });

  mongoose.connection.on("error", (err) => {
    logger.error(`MongoDB connection error: ${err.message}`);
  });

  mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB disconnected");
  });

  await mongoose.connect(env.mongoUri);
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}


// import mongoose from "mongoose";
// import { env } from "../config/env";
// import { logger } from "../config/logger";
// import { syncApifyInstagramFeed } from "../modules/instagram/instagram-sync";

// interface ConnectionOptions {
//   skipSync?: boolean;
// }

// export async function connectDatabase(options: ConnectionOptions = {}): Promise<void> {
//   mongoose.set("strictQuery", true);

//   // Clear existing listeners to prevent double-binding if called multiple times in tests
//   mongoose.connection.removeAllListeners("connected");
//   mongoose.connection.removeAllListeners("error");
//   mongoose.connection.removeAllListeners("disconnected");

//   mongoose.connection.on("connected", () => {
//     // Only kick off heavy background processes if we aren't running a seed or CLI script
//     if (!options.skipSync) {
//       syncApifyInstagramFeed();
//     }
//     logger.info("MongoDB connected");
//   });

//   mongoose.connection.on("error", (err) => {
//     logger.error(`MongoDB connection error: ${err.message}`);
//   });

//   mongoose.connection.on("disconnected", () => {
//     logger.warn("MongoDB disconnected");
//   });

//   await mongoose.connect(env.mongoUri);
// }

// export async function disconnectDatabase(): Promise<void> {
//   await mongoose.disconnect();
// }