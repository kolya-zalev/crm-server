import { Module } from '@nestjs/common';
import { TasksController, LeadTasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  controllers: [TasksController, LeadTasksController],
  providers: [TasksService],
})
export class TasksModule {}
