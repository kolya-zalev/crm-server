import { Logger } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import { NotificationsService } from "../notifications/notifications.service";
import { CreateTaskDto, UpdateTaskDto } from "./dto/task.dto";
import { Actor, leadsMessages, leadStatuses } from "@app/contracts";
import { LeadsClient } from "../leads/leads.client";
@Injectable()
export class TasksFacade {
  private readonly logger = new Logger(TasksFacade.name);

  constructor(
    private readonly tasks: LeadsClient,
    private readonly notificationsService: NotificationsService,
  ) {}
  async findAll() {
    return await this.tasks.send(leadsMessages.tasksFindAll, {});
  }
  async findByLead(leadId: string) {
    return await this.tasks.send(leadsMessages.tasksFindByLead, { leadId });
  }
  async update(taskId: string, dto: UpdateTaskDto) {
    return await this.tasks.send(leadsMessages.tasksUpdate, {
      taskId,
      data: dto,
    });
  }
  async create(leadId: string, dto: CreateTaskDto, actor: Actor) {
    const { task, leadName } = await this.tasks.send(
      leadsMessages.tasksCreate,
      { leadId, data: dto, actor },
    );

    try {
      await this.notificationsService.notifyTaskCreated({
        actor,
        leadId,
        leadName,
        taskTitle: task.title,
      });
    } catch (error) {
      this.logger.error("Failed to create task notifications", error as Error);
    }
    return task;
  }
  async remove(taskId: string, actor: Actor) {
    const { task, leadName } = await this.tasks.send(
      leadsMessages.tasksRemove,
      { taskId },
    );
    try {
      await this.notificationsService.notifyTaskDeleted({
        actor,
        leadId: task.leadId,
        leadName,
        assignTask: task.title,
      });
    } catch (error) {
      this.logger.error("Failed to remove task notifications", error as Error);
    }
  }
}
