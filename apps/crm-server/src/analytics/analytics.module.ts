import { Module } from "@nestjs/common";
import { LeadsModule } from "../leads/leads.module";
import { UsersModule } from "../users/users.module";
import { AnalyticsController } from "./analytics.controller";
import { AnalyticsFacade } from "./analytics.facade";

@Module({
  imports: [LeadsModule, UsersModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsFacade],
})
export class AnalyticsModule {}
