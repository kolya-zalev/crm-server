import { Actor } from "src/auth/current-user.decorator";

export type NotificationDto = {
  id: string;
  type: string;
  message: string;
  leadId: string | null;
  actorName: string;
  isRead: boolean;
  createdAt: string;
};

export type NotificationListDto = {
  items: NotificationDto[];
  unreadCount: number;
};

export type NotificationRow = {
  id: string;
  type: string;
  message: string;
  leadId: string | null;
  actorName: string;
  isRead: boolean;
  createdAt: Date;
};

export type CreateNotifications = {
    userId: string
    type: NotificationRow,
    message: string,
    leadId?: string,
    actor: Actor
}