export const permissions = {
  leadRead: "lead:read",
  leadCreate: "lead:create",
  leadUpdate: "lead:update",
  leadUpdateStatus: "lead:update-status",
  leadTake: "lead:take",
  leadAssign: "lead:assign",
  leadUnassign: "lead:unassign",
  leadDelete: "lead:delete",
  leadBeAssigned: "lead:be-assigned",
  userListAssignable: "user:list-assignable",
  teamRead: "team:read",
  teamManage: "team:manage",
  analyticsView: "analytics:view",
  notificationLeadEvents: "notification:lead-events",
} as const;

export type Permission = (typeof permissions)[keyof typeof permissions];

export const roles = ["admin", "manager", "member"] as const;
export type Role = (typeof roles)[number];

export const rolePermissions: Record<Role, readonly Permission[]> = {
  admin: Object.values(permissions),
  manager: [
    permissions.leadRead,
    permissions.leadCreate,
    permissions.leadUpdate,
    permissions.leadUpdateStatus,
    permissions.leadTake,
    permissions.leadAssign,
    permissions.leadDelete,
    permissions.userListAssignable,
    permissions.teamRead,
    permissions.notificationLeadEvents,
  ],
  member: [
    permissions.leadRead,
    permissions.leadCreate,
    permissions.leadUpdateStatus,
    permissions.leadTake,
    permissions.leadBeAssigned,
    permissions.userListAssignable,
    permissions.teamRead,
  ],
};


export const getPermissionsForRole = (role: string): Permission[] =>
  role in rolePermissions ? [...rolePermissions[role as Role]] : [];

export const getRolesWithPermission = (permission: Permission): Role[] =>
  roles.filter((role) => rolePermissions[role].includes(permission));
