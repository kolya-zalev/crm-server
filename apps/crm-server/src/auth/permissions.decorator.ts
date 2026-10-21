import { SetMetadata } from "@nestjs/common";
import type { Permission } from "../../../../libs/contracts/src/permissions.constants";

export const permissionsKey = "permissions";
export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(permissionsKey, permissions);
