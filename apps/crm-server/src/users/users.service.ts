import { Injectable } from "@nestjs/common";
import {
  messages,
  type AssignableUser,
  type ChangePasswordResponse,
  type Permission,
  type PublicUser,
  type UserRef,
} from "@app/contracts";
import { UpdateMeDto } from "./dto/update-me.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { UsersClient } from "./users.client";

@Injectable()
export class UsersService {
  constructor(private readonly users: UsersClient) {}

  listAssignable(): Promise<AssignableUser[]> {
    return this.users.send(messages.usersListAssignable, {});
  }

  getAssignable(id: string): Promise<UserRef> {
    return this.users.send(messages.usersGetAssignable, { userId: id });
  }

  async findByIds(ids: string[]): Promise<UserRef[]> {
    if (ids.length === 0) return [];
    return this.users.send(messages.usersFindByIds, { ids });
  }

  findByPermission(permission: Permission): Promise<{ id: string }[]> {
    return this.users.send(messages.usersFindByPermission, { permission });
  }

  listAll(): Promise<UserRef[]> {
    return this.users.send(messages.usersListAll, {});
  }

  getMe(userId: string): Promise<PublicUser> {
    return this.users.send(messages.usersGetMe, { userId });
  }

  updateMe(userId: string, dto: UpdateMeDto): Promise<PublicUser> {
    return this.users.send(messages.usersUpdateMe, { userId, ...dto });
  }

  changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<ChangePasswordResponse> {
    return this.users.send(messages.usersChangePassword, { userId, ...dto });
  }
}
