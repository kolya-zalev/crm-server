import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTaskDto, UpdateTaskDto } from "./dto/task.dto";

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

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

  async create(leadId: string, dto: CreateTaskDto) {
    return this.prisma.task.create({
      data: {
        leadId,
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        dueDate: new Date(dto.dueDate),
        status: "pending",
      },
    });
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

  async remove(taskId: string): Promise<void> {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException(`Task ${taskId} not found`);

    await this.prisma.task.delete({ where: { id: taskId } });
  }
}
