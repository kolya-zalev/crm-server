import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type { Actor } from "../auth/current-user.decorator";
import { NotificationsSseHub } from "./notifications-sse.hub";
import {
  notificationListLimit,
  notificationSseEvents,
  notificationTypes,
  type NotificationType,
} from "./notifications.constants";
import type {
  NotificationDto,
  NotificationListDto,
  NotificationRow,
} from "./dto/notification.dto";
import {
  permissions,
  type Permission,
} from "../../../../libs/contracts/src/permissions.constants";
import { UsersService } from "../users/users.service";

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sseHub: NotificationsSseHub,
    private readonly users: UsersService,
  ) {}

  private toDto(row: NotificationRow): NotificationDto {
    return {
      id: row.id,
      type: row.type,
      message: row.message,
      leadId: row.leadId,
      actorName: row.actorName,
      isRead: row.isRead,
      createdAt: row.createdAt.toISOString(),
    };
  }
  async listForUser(userId: string): Promise<NotificationListDto> {
    const [rows, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: notificationListLimit,
      }),
      this.prisma.notification.count({
        where: { userId, isRead: false },
      }),
    ]);

    return { items: rows.map((row) => this.toDto(row)), unreadCount };
  }
  async markAsRead(userId: string, id: string): Promise<NotificationListDto> {
    const result = await this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });

    if (result.count === 0) {
      throw new NotFoundException(`Notification ${id} not found`);
    }

    return this.listForUser(userId);
  }
  async markAllAsRead(userId: string): Promise<NotificationListDto> {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return this.listForUser(userId);
  }
  async markAllDelete(userId: string): Promise<NotificationListDto> {
    await this.prisma.notification.deleteMany({
      where: { userId },
    });
    return this.listForUser(userId);
  }
  private async createForUser(input: {
    userId: string;
    type: NotificationType;
    message: string;
    leadId?: string | null;
    actor: Actor;
  }): Promise<NotificationDto | null> {
    if (input.userId === input.actor.id) return null;

    const row = await this.prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        message: input.message,
        leadId: input.leadId ?? null,
        actorId: input.actor.id,
        actorName: input.actor.name,
      },
    });

    const dto = this.toDto(row);
    this.sseHub.sendToUser(
      input.userId,
      dto,
      notificationSseEvents.notification,
    );
    return dto;
  }
  private async createForLeaders(input: {
    type: NotificationType;
    message: string;
    leadId?: string | null;
    actor: Actor;
  }): Promise<void> {
    const leaders = (
      await this.users.findByPermission(permissions.notificationLeadEvents)
    ).filter((leader) => leader.id !== input.actor.id);

    await Promise.all(
      leaders.map((leader) =>
        this.createForUser({ ...input, userId: leader.id }),
      ),
    );
  }
  async notifyLeadAssigned(params: {
    actor: Actor;
    assignedId: string;
    assignedName: string;
    leadId: string;
    leadName: string;
  }): Promise<void> {
    const { actor, assignedId, assignedName, leadId, leadName } = params;
    const has = (permission: Permission) =>
      actor.permissions.includes(permission);

    await this.createForUser({
      userId: assignedId,
      type: notificationTypes.leadAssigned,
      message: `${actor.name} assigned you a lead ${leadName}`,
      leadId,
      actor,
    });
    if (!has(permissions.leadAssign)) {
      await this.createForLeaders({
        type: notificationTypes.leadAssignedByMember,
        message: `${actor.name} assigned ${assignedName} to the lead ${leadName}`,
        leadId,
        actor,
      });
    }
  }
  async notifyLeadClosed(params: {
    actor: Actor;
    leadId: string;
    leadName: string;
    status: string;
  }): Promise<void> {
    const { actor, leadId, leadName, status } = params;

    await this.createForLeaders({
      type: notificationTypes.leadClosed,
      message: `${actor.name} marked the lead ${leadName} as ${status}`,
      leadId,
      actor,
    });
  }
  async notifyTaskCreated(params: {
    actor: Actor;
    leadId: string;
    leadName: string;
    taskTitle: string;
  }): Promise<void> {
    const { actor, leadId, leadName, taskTitle } = params;

    await this.createForLeaders({
      type: "task_created",
      message: `${actor.name} added the task ${taskTitle} for ${leadName}`,
      leadId,
      actor,
    });
  }
  async notifyTaskDeleted(params: {
    actor: Actor;
    leadId: string;
    leadName: string;
    assignTask: string;
  }): Promise<void> {
    const { actor, leadId, leadName, assignTask } = params;

    await this.createForLeaders({
      type: "task_deleted",
      message: `${actor.name} deleted ${assignTask} on ${leadName}`,
      leadId,
      actor,
    });
  }

  async notifyLeadStatusChanged(params: {
    actor: Actor;
    leadId: string;
    leadName: string;
    status: string;
  }): Promise<void> {
    const { actor, leadId, leadName, status } = params;
    await this.createForLeaders({
      type: notificationTypes.leadStatusChanged,
      message: `${actor.name} moved ${leadName} in ${status}`,
      leadId,
      actor,
    });
  }
}
