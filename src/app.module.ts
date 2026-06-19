import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { LeadsModule } from './leads/leads.module';
import { NotesModule } from './notes/notes.module';
import { ActivitiesModule } from './activities/activities.module';
import { TasksModule } from './tasks/tasks.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Module({
  imports: [
    PrismaModule,
    LeadsModule,       // /api/leads
    NotesModule,       // /api/leads/:id/notes
    ActivitiesModule,  // /api/leads/:id/activities
    TasksModule,       // /api/tasks + /api/leads/:id/tasks
    AuthModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
