import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "../../generated/client";
import { getPrismaClientOptions } from "./prisma-client-options";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super(getPrismaClientOptions());
  }

  async onModuleInit() {
    await this.$connect();
    console.log(
      "📡 [users-service] База данных users_db успешно подключена",
    );
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
