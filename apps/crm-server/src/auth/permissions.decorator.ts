import { SetMetadata } from "@nestjs/common";
import type { Permission } from "@app/contracts";

export const permissionsKey = "permissions";
export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(permissionsKey, permissions);
