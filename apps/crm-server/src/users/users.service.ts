import { HttpException, Inject, Injectable } from "@nestjs/common";
import { APIError } from "better-auth/api";
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
import { AUTH, type Auth } from "../auth/better-auth";
@Injectable()
export class UsersService {
  constructor(
    private readonly users: UsersClient,
    @Inject(AUTH) private readonly auth: Auth,
  ) {}

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

  async updateMe(userId: string, dto: UpdateMeDto): Promise<PublicUser> {
    const user = await this.users.send(messages.usersUpdateMe, {
      userId,
      ...dto,
    });
    const context = await this.auth.$context;
    await context.internalAdapter.updateUser(userId, {
      name: user.name,
      email: user.email,
    });
    return user;
  }

  async changePassword(
    headers: Headers,
    dto: ChangePasswordDto,
  ): Promise<ChangePasswordResponse> {
    try {
      await this.auth.api.changePassword({ headers, body: dto });
    } catch (error) {
      if (error instanceof APIError) {
        throw new HttpException(error.body ?? error.message, error.statusCode);
      }
      throw error;
    }
    return { ok: true };
  }
}
