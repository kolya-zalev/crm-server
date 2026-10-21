import { Body, Controller, Get, Patch, Post } from "@nestjs/common";
import { Actor, CurrentUser } from "../auth/current-user.decorator";
import { RequirePermissions } from "../auth/permissions.decorator";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { UpdateMeDto } from "./dto/update-me.dto";
import { UsersService } from "./users.service";

@Controller("/api/users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("assignable")
  @RequirePermissions("user:list-assignable")
  listAssignable() {
    return this.usersService.listAssignable();
  }
  @Get("me")
  getMe(@CurrentUser() actor: Actor) {
    return this.usersService.getMe(actor.id);
  }
  @Patch("me")
  updateMe(@CurrentUser() actor: Actor, @Body() dto: UpdateMeDto) {
    return this.usersService.updateMe(actor.id, dto);
  }
  @Post("me/password")
  changePassword(@CurrentUser() actor: Actor, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(actor.id, dto);
  }
}
