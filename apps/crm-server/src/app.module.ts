import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { LeadsModule } from "./leads/leads.module";
import { NotesModule } from "./notes/notes.module";
import { ActivitiesModule } from "./activities/activities.module";
import { TasksModule } from "./tasks/tasks.module";
import { AuthModule } from "./auth/auth.module";
import { APP_GUARD } from "@nestjs/core";
import { SessionAuthGuard } from "./auth/session-auth.guard";
import { TeamModule } from "./team/team.module";
import { ChatModule } from "./chat/chat.module";
import { PermissionsGuard } from "./auth/permissions.guard";
import { AnalyticsModule } from "./analytics/analytics.module";
import { UsersModule } from "./users/users.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { RolesModule } from "./roles/roles.module";
import { BullModule } from "@nestjs/bullmq";
@Module({
  imports: [
    PrismaModule,
    AuthModule,
    LeadsModule, // /api/leads
    NotesModule, // /api/leads/:id/notes
    ActivitiesModule, // /api/leads/:id/activities
    TasksModule, // /api/tasks + /api/leads/:id/tasks
    TeamModule, // /api/team
    RolesModule,
    ChatModule,
    AnalyticsModule,
    UsersModule,
    NotificationsModule,
    BullModule.forRoot({
      connection: {
        host: "localhost",
        port: "6379",
      },
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: SessionAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class AppModule {}
