import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { LeadsController } from "./leads/leads.controller";
import { LeadsService } from "./leads/leads.service";
import { TasksController } from "./tasks/tasks.controller";
import { TasksService } from "./tasks/tasks.service";
import { ActivitiesController } from "./activities/activities.controller";
import { ActivitiesService } from "./activities/activities.service";
import { NotesController } from "./notes/notes.controller";
import { NotesService } from "./notes/notes.service";
import { AnalyticsController } from "./analytics/analytics.controller";
import { AnalyticsService } from "./analytics/analytics.service";

@Module({
  imports: [PrismaModule],
  controllers: [
    LeadsController,
    NotesController,
    TasksController,
    ActivitiesController,
    AnalyticsController,
  ],
  providers: [
    LeadsService,
    NotesService,
    TasksService,
    ActivitiesService,
    AnalyticsService,
  ],
})
export class LeadsServiceModule {}
