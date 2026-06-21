import { Injectable, NotFoundException } from '@nestjs/common';
import { Notification } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

type CreateNotificationInput = {
  userId: string;
  type: string;
  title: string;
  message: string;
};

type NotificationResponse = {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findForUser(userId: string): Promise<NotificationResponse[]> {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return notifications.map((notification) =>
      this.sanitizeNotification(notification),
    );
  }

  getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { userId, read: false },
    });
  }

  create(data: CreateNotificationInput) {
    return this.prisma.notification.create({ data });
  }

  async markAsRead(
    userId: string,
    id: string,
  ): Promise<NotificationResponse> {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    const updated = await this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    return this.sanitizeNotification(updated);
  }

  markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  private sanitizeNotification(
    notification: Notification,
  ): NotificationResponse {
    return {
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      read: notification.read,
      createdAt: notification.createdAt.toISOString(),
    };
  }
}
