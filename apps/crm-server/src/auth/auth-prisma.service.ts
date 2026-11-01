import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "../../generated/auth-client";


function getAuthPrismaClientOptions(): Prisma.PrismaClientOptions {
  const connectionString = process.env.AUTH_DATABASE_URL;
  if (!connectionString) {
    throw new Error("AUTH_DATABASE_URL is not set");
  }

  return {
    adapter: new PrismaPg({ connectionString }),
  };
}
@Injectable()
export class AuthPrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy
    {
        constructor () {
            super(getAuthPrismaClientOptions())
        }

        async onModuleInit() {
            await this.$connect();
            console.log("DB auth_db was success connected")
        }
        async onModuleDestroy() {
            await this.$disconnect();
        }
    }
