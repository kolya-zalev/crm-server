import { Injectable } from "@nestjs/common";
import { CreateTaskDto, UpdateTaskDto } from "./dto/task.dto";
import { Actor, leadsMessages } from "@app/contracts";
import { LeadsClient } from "../leads/leads.client";
import { NotificationsProducer } from "../notifications/notifications.producer";
@Injectable()
export class TasksFacade {

  constructor(
    private readonly tasks: LeadsClient,
    private readonly notificationsProducer: NotificationsProducer,
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

    await this.notificationsProducer.taskCreated({
      actor,
      leadId,
      leadName,
      taskTitle: task.title,
    });

    return task;
  }
  async remove(taskId: string, actor: Actor) {
    const { task, leadName } = await this.tasks.send(
      leadsMessages.tasksRemove,
      { taskId },
    );

    await this.notificationsProducer.taskDeleted({
      actor,
      leadId: task.leadId,
      leadName,
      assignTask: task.title,
    });
  }
}
