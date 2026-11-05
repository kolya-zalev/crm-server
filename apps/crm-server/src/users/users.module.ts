import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import {
  USERS_SERVICE,
  USERS_SERVICE_DEFAULT_PORT,
  USERS_SERVICE_HOST,
  USERS_SERVICE_PORT,
} from "@app/contracts";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { UsersClient } from "./users.client";

@Module({
  imports: [
    ClientsModule.register([
      {
        name: USERS_SERVICE,
        transport: Transport.TCP,
        options: {
          host: process.env[USERS_SERVICE_HOST] ?? "localhost",
          port:
            Number(process.env[USERS_SERVICE_PORT]) ||
            USERS_SERVICE_DEFAULT_PORT,
        },
      },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersClient],
  exports: [UsersService, UsersClient],
})
export class UsersModule {}
