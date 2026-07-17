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

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    LeadsModule, // /api/leads
    NotesModule, // /api/leads/:id/notes
    ActivitiesModule, // /api/leads/:id/activities
    TasksModule, // /api/tasks + /api/leads/:id/tasks
    TeamModule, // /api/team
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
