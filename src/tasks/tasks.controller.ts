import {
  Body, Controller, Delete, Get, HttpCode, Param, Post, Put,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from 'src/auth/roles.decorator';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';

// /api/tasks — все задачи + update/delete по taskId
@Controller('api/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll() {
    return this.tasksService.findAll();
  }

  @Put(':taskId')
  @Roles(Role.admin, Role.manager, Role.sales)
  update(@Param('taskId') taskId: string, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(taskId, dto);
  }

  @Delete(':taskId')
  @HttpCode(204)
  @Roles(Role.admin, Role.manager)
  remove(@Param('taskId') taskId: string) {
    return this.tasksService.remove(taskId);
  }
}

// /api/leads/:id/tasks — задачи лида + создание
@Controller('api/leads/:id/tasks')
export class LeadTasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findByLead(@Param('id') leadId: string) {
    return this.tasksService.findByLead(leadId);
  }

  @Post()
  @Roles(Role.admin, Role.manager, Role.sales)
  create(@Param('id') leadId: string, @Body() dto: CreateTaskDto) {
    return this.tasksService.create(leadId, dto);
  }
}
