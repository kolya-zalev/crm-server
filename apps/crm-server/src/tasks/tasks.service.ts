import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTaskDto, UpdateTaskDto } from "./dto/task.dto";
import { NotificationsService } from "../notifications/notifications.service";
import type { Actor } from "../auth/current-user.decorator";

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async findAll() {
    return this.prisma.task.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async findByLead(leadId: string) {
    return this.prisma.task.findMany({
      where: { leadId },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(leadId: string, dto: CreateTaskDto, actor: Actor) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      select: { id: true, name: true },
    });
    if (!lead) {
      throw new NotFoundException(`Lead ${leadId} not found`);
    }

    const task = await this.prisma.task.create({
      data: {
        leadId,
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        dueDate: new Date(dto.dueDate),
        status: "pending",
      },
    });

    try {
      await this.notifications.notifyTaskCreated({
        actor,
        leadId: lead.id,
        leadName: lead.name,
        taskTitle: dto.title,
      });
    } catch (error) {
      this.logger.error("Failed to create task notification", error as Error);
    }

    return task;
  }

  async update(taskId: string, dto: UpdateTaskDto) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException(`Task ${taskId} not found`);

    return this.prisma.task.update({
      where: { id: taskId },
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        completedAt: dto.completedAt ? new Date(dto.completedAt) : undefined,
      },
    });
  }

  async remove(taskId: string, actor: Actor): Promise<void> {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException(`Task ${taskId} not found`);
    const lead = await this.prisma.lead.findUnique({
      where: { id: task.leadId },
      select: { id: true, name: true },
    });
    if (!lead) throw new NotFoundException(`Lead ${task.leadId} not found`);

    await this.prisma.task.delete({ where: { id: taskId } });

    try {
      await this.notifications.notifyTaskDeleted({
        actor,
        leadId: lead.id,
        leadName: lead.name,
        assignTask: task.title,
      });
    } catch (error) {
      this.logger.error(`Failed to delete task notification`, error as Error);
    }
  }
}
