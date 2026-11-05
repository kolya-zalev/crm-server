import { Module } from "@nestjs/common";
import { LeadsModule } from "../leads/leads.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { TasksController, LeadTasksController } from "./tasks.controller";
import { TasksFacade } from "./tasks.facade";

@Module({
  imports: [LeadsModule, NotificationsModule],
  controllers: [TasksController, LeadTasksController],
  providers: [TasksFacade],
})
export class TasksModule {}
