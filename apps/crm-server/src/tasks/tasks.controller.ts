import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
} from "@nestjs/common";
import { TasksService } from "./tasks.service";
import { CreateTaskDto, UpdateTaskDto } from "./dto/task.dto";
import { CurrentUser, type Actor } from "../auth/current-user.decorator";
import { RequirePermissions } from "../auth/permissions.decorator";

// /api/tasks — все задачи + update/delete по taskId
@Controller("api/tasks")
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @RequirePermissions("lead:read")
  findAll() {
    return this.tasksService.findAll();
  }

  @Put(":taskId")
  update(@Param("taskId") taskId: string, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(taskId, dto);
  }

  @Delete(":taskId")
  @HttpCode(204)
  remove(@Param("taskId") taskId: string, @CurrentUser() actor: Actor) {
    return this.tasksService.remove(taskId, actor);
  }
}

// /api/leads/:id/tasks — задачи лида + создание
@Controller("api/leads/:id/tasks")
export class LeadTasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @RequirePermissions("lead:read")
  findByLead(@Param("id") leadId: string) {
    return this.tasksService.findByLead(leadId);
  }

  @Post()
  create(
    @Param("id") leadId: string,
    @Body() dto: CreateTaskDto,
    @CurrentUser() actor: Actor,
  ) {
    return this.tasksService.create(leadId, dto, actor);
  }
}
