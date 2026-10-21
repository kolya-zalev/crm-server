import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import {
  messages,
  type AssignableUser,
  type ChangePasswordPayload,
  type ChangePasswordResponse,
  type FindByIdsPayload,
  type FindByPermissionPayload,
  type GetAssignablePayload,
  type GetMePayload,
  type PublicUser,
  type UpdateMePayload,
  type UserRef,
} from "@app/contracts";
import { UsersService } from "./users.service";

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // профиль текущего юзера (userId кладёт BFF из токена)

  @MessagePattern(messages.usersGetMe)
  getMe(@Payload() { userId }: GetMePayload): Promise<PublicUser> {
    return this.usersService.getMe(userId);
  }

  @MessagePattern(messages.usersUpdateMe)
  updateMe(@Payload() payload: UpdateMePayload): Promise<PublicUser> {
    return this.usersService.updateMe(payload);
  }

  @MessagePattern(messages.usersChangePassword)
  changePassword(
    @Payload() payload: ChangePasswordPayload,
  ): Promise<ChangePasswordResponse> {
    return this.usersService.changePassword(payload);
  }

  // запросы от других модулей BFF (leads, notifications, analytics)

  @MessagePattern(messages.usersListAssignable)
  listAssignable(): Promise<AssignableUser[]> {
    return this.usersService.listAssignable();
  }

  @MessagePattern(messages.usersGetAssignable)
  getAssignable(@Payload() { userId }: GetAssignablePayload): Promise<UserRef> {
    return this.usersService.getAssignable(userId);
  }

  @MessagePattern(messages.usersFindByIds)
  findByIds(@Payload() { ids }: FindByIdsPayload): Promise<UserRef[]> {
    return this.usersService.findByIds(ids);
  }

  @MessagePattern(messages.usersFindByPermission)
  findByPermission(
    @Payload() { permission }: FindByPermissionPayload,
  ): Promise<{ id: string }[]> {
    return this.usersService.findByPermission(permission);
  }

  @MessagePattern(messages.usersListAll)
  listAll(): Promise<UserRef[]> {
    return this.usersService.listAll();
  }
}
