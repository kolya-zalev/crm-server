import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import type { Actor } from "src/auth/current-user.decorator";
import { NotificationsSseHub } from "./notifications-sse.hub";
import {
  adminRole,
  memberRole,
  notificationListLimit,
  notificationSseEvents,
  notificationTypes,
  type NotificationType,
} from "./notifications.constants";
import type {
  NotificationDto,
  NotificationListDto,
  NotificationRow,
  CreateNotifications,
} from "./dto/notificationsDto";

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sseHub: NotificationsSseHub,
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
  private async createForAdmins(input: {
    type: NotificationType;
    message: string;
    leadId?: string | null;
    actor: Actor;
  }): Promise<void> {
    const admins = await this.prisma.user.findMany({
      where: { role: adminRole, id: { not: input.actor.id } },
      select: { id: true },
    });

    await Promise.all(
      admins.map((admin) => this.createForUser({ ...input, userId: admin.id })),
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

    await this.createForUser({
      userId: assignedId,
      type: notificationTypes.leadAssigned,
      message: `${actor.name} assigned you a lead ${leadName}`,
      leadId,
      actor,
    });
    if (actor.role === memberRole) {
      await this.createForAdmins({
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

    await this.createForAdmins({
      type: notificationTypes.leadClosed,
      message: `${actor.name} marked the lead ${leadName} as ${status}`,
      leadId,
      actor,
    });
  }
}
