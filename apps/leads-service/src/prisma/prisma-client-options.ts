import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma } from "../../generated/client";

export function getPrismaClientOptions(): Prisma.PrismaClientOptions {
  const connectionString = process.env.LEADS_DATABASE_URL;
  if (!connectionString) {
    throw new Error("LEADS_DATABASE_URL is not set");
  }

  return {
    adapter: new PrismaPg({ connectionString }),
  };
}
