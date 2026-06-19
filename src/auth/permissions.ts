import {Role} from '@prisma/client';

export const PERMISSIONS = {
    'leads:read': [Role.admin, Role.manager, Role.sales, Role.viewer],
    'leads:create': [Role.admin, Role.manager, Role.sales],
    'leads:edit': [Role.admin, Role.manager, Role.sales],
    "leads:delete": [Role.admin, Role.manager],
    'leads:import': [Role.admin, Role.manager, Role.sales],
    'leads:export': [Role.admin, Role.manager, Role.sales],
    'leads:view': [Role.admin, Role.manager, Role.sales, Role.viewer],
} as const;

export type Permission = keyof typeof PERMISSIONS;

export function hasPermission(role: Role, permission: Permission): boolean {
    return (PERMISSIONS[permission] as readonly Role[]).includes(role);
  }