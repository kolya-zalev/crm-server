import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { LeadsModule } from "./leads/leads.module";
import { NotesModule } from "./notes/notes.module";
import { ActivitiesModule } from "./activities/activities.module";
import { TasksModule } from "./tasks/tasks.module";
import { AuthModule } from "./auth/auth.module";
import { APP_GUARD } from "@nestjs/core";
import { JwtAuthGuard } from "./auth/jwt-auth.guard";
import { TeamModule } from "./team/team.module";
import { ChatModule } from "./chat/chat.module";
import { RolesGuard } from "./auth/roles.guard";
import { AnalyticsModule } from "./analytics/analytics.module";
import { UserModule } from "./users/users.module";
import { NotificationsModule } from "./notifications/notifications.module";

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    LeadsModule, // /api/leads
    NotesModule, // /api/leads/:id/notes
    ActivitiesModule, // /api/leads/:id/activities
    TasksModule, // /api/tasks + /api/leads/:id/tasks
    TeamModule, // /api/team
    ChatModule,
    AnalyticsModule,
    UserModule,
    NotificationsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
