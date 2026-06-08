import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { LeadsModule } from './leads/leads.module';
import { NotesModule } from './notes/notes.module';
import { ActivitiesModule } from './activities/activities.module';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    PrismaModule,
    LeadsModule,       // /api/leads
    NotesModule,       // /api/leads/:id/notes
    ActivitiesModule,  // /api/leads/:id/activities
    TasksModule,       // /api/tasks + /api/leads/:id/tasks
  ],
})
export class AppModule {}
