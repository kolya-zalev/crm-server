import { Injectable, NotFoundException } from "@nestjs/common";
import type {
  CreateTaskPayload,
  LeadIdPayload,
  RemoveTaskPayload,
  TaskDto,
  TaskWithLeadName,
  UpdateTaskPayload,
} from "@app/contracts";
import { PrismaService } from "../prisma/prisma.service";
import { toTaskDto } from "../leads/leads.mapper";

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<TaskDto[]> {
    const tasks = await this.prisma.task.findMany({
      orderBy: { createdAt: "desc" },
    });
    return tasks.map(toTaskDto);
  }

  async findByLead({ leadId }: LeadIdPayload): Promise<TaskDto[]> {
    const tasks = await this.prisma.task.findMany({
      where: { leadId },
      orderBy: { createdAt: "desc" },
    });
    return tasks.map(toTaskDto);
  }

  async create({ leadId, data }: CreateTaskPayload): Promise<TaskWithLeadName> {
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
        title: data.title,
        description: data.description,
        priority: data.priority,
        dueDate: new Date(data.dueDate),
        status: "pending",
      },
    });

    return { task: toTaskDto(task), leadName: lead.name };
  }

  async update({ taskId, data }: UpdateTaskPayload): Promise<TaskDto> {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException(`Task ${taskId} not found`);

    const updated = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
      },
    });
    return toTaskDto(updated);
  }

  async remove({ taskId }: RemoveTaskPayload): Promise<TaskWithLeadName> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { lead: { select: { name: true } } },
    });
    if (!task) throw new NotFoundException(`Task ${taskId} not found`);

    await this.prisma.task.delete({ where: { id: taskId } });

    const { lead, ...taskRow } = task;
    return { task: toTaskDto(taskRow), leadName: lead.name };
  }
}
