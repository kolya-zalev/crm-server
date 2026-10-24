import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import {
  leadsMessages,
  type CreateTaskPayload,
  type LeadIdPayload,
  type RemoveTaskPayload,
  type TaskDto,
  type TaskWithLeadName,
  type UpdateTaskPayload,
} from "@app/contracts";
import { TasksService } from "./tasks.service";

@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @MessagePattern(leadsMessages.tasksFindAll)
  findAll(): Promise<TaskDto[]> {
    return this.tasksService.findAll();
  }

  @MessagePattern(leadsMessages.tasksFindByLead)
  findByLead(@Payload() payload: LeadIdPayload): Promise<TaskDto[]> {
    return this.tasksService.findByLead(payload);
  }

  @MessagePattern(leadsMessages.tasksCreate)
  create(@Payload() payload: CreateTaskPayload): Promise<TaskWithLeadName> {
    return this.tasksService.create(payload);
  }

  @MessagePattern(leadsMessages.tasksUpdate)
  update(@Payload() payload: UpdateTaskPayload): Promise<TaskDto> {
    return this.tasksService.update(payload);
  }

  @MessagePattern(leadsMessages.tasksRemove)
  remove(@Payload() payload: RemoveTaskPayload): Promise<TaskWithLeadName> {
    return this.tasksService.remove(payload);
  }
}
