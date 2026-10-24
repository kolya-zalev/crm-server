import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import {
  LEADS_SERVICE,
  LEADS_SERVICE_DEFAULT_PORT,
  LEADS_SERVICE_HOST,
  LEADS_SERVICE_PORT,
} from "@app/contracts";
import { LeadsController } from "./leads.controller";
import { LeadsClient } from "./leads.client";
import { LeadsFacade } from "./leads.facade";
import { NotificationsModule } from "../notifications/notifications.module";
import { UsersModule } from "../users/users.module";
@Module({
  imports: [
    ClientsModule.register([
      {
        name: LEADS_SERVICE,
        transport: Transport.TCP,
        options: {
          host: process.env[LEADS_SERVICE_HOST] ?? "localhost",
          port:
            Number(process.env[LEADS_SERVICE_PORT]) ||
            LEADS_SERVICE_DEFAULT_PORT,
        },
      },
    ]),
    NotificationsModule,
    UsersModule,
  ],
  controllers: [LeadsController],
  providers: [LeadsFacade, LeadsClient],
  exports: [LeadsClient],
})
export class LeadsModule {}
