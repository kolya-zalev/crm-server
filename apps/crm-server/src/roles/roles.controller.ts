import { Controller, Get } from "@nestjs/common";
import { RequirePermissions } from "../auth/permissions.decorator";
import { permissions, roles, rolePermissions } from "@app/contracts";
import type { RoleInfo } from "@app/contracts";

@Controller("api/roles")
export class RolesController {
  @Get()
  @RequirePermissions(permissions.roleRead)
  findAll(): RoleInfo[] {
    return roles.map((role) => ({
      role,
      permissions: [...rolePermissions[role]],
    }));
  }
}
