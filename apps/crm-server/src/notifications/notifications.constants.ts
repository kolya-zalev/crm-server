export const notificationTypes = {
  leadAssigned: "lead_assigned",
  leadAssignedByMember: "lead_assigned_by_member",
  leadClosed: "lead_closed",
  leadStatusChanged: "lead_status_changed",
  taskCreated: "task_created",
  taskDeleted: "task_deleted",
} as const;

export type NotificationType =
  (typeof notificationTypes)[keyof typeof notificationTypes];

export const notificationSseEvents = {
  conected: "connected",
  notification: "notification",
} as const;

export const notificationListLimit = 20;
export const notificationHeartbeatMs = 25_000;
