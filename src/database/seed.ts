import { connectDatabase, disconnectDatabase } from "../database/connection";
import { userRepository } from "../modules/users/repositories/user.repository";
import { UserRole } from "../modules/users/interfaces/user.interface";
import { logger } from "../config/logger";

// Provide a minimal declaration for `process` to satisfy TypeScript
// when @types/node is not installed.
declare const process: any;

async function seed() {
  await connectDatabase();

  const email = process.env.OWNER_EMAIL ?? "ceo@belhomz.com";
  const name = process.env.OWNER_NAME ?? "System Administrator";
  const password = process.env.OWNER_PASSWORD ?? "ceoPassword123";

  const existing = await userRepository.findByEmail(email);
  if (existing) {
    logger.info(`Owner account already exists for ${email} — skipping seed.`);
    await disconnectDatabase();
    return;
  }

  const owner = await userRepository.create({
    name,
    email,
    password,
    role: UserRole.OWNER,
  } as any);

  logger.info(`Owner account created: ${owner.email}`);
  logger.info(`Login with email "${email}" and the password you set (or the default — change it immediately if so).`);

  await disconnectDatabase();
}

seed().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Seed failed:", err);
  process.exit(1);
});