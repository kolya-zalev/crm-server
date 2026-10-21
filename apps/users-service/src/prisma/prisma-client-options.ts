import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma } from "../../generated/client";

// users-service ходит только в свою базу — users_db
export function getPrismaClientOptions(): Prisma.PrismaClientOptions {
  const connectionString = process.env.USERS_DATABASE_URL;
  if (!connectionString) {
    throw new Error("USERS_DATABASE_URL is not set");
  }

  return {
    adapter: new PrismaPg({ connectionString }),
  };
}
