import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import {
  getPermissionsForRole,
  getRolesWithPermission,
  permissions,
  type AssignableUser,
  type ChangePasswordPayload,
  type ChangePasswordResponse,
  type Permission,
  type PublicUser,
  type UpdateMePayload,
  type UserRef,
} from "@app/contracts";
import { PrismaService } from "../prisma/prisma.service";
import { nextEmailChangeAt } from "./users-email.constants";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  listAssignable(): Promise<AssignableUser[]> {
    return this.prisma.user.findMany({
      where: {
        role: { in: getRolesWithPermission(permissions.leadBeAssigned) },
      },
      select: { id: true, name: true, role: true },
      orderBy: { name: "asc" },
    });
  }

  async getAssignable(id: string): Promise<UserRef> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, role: true },
    });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    const canBeAssigned = getPermissionsForRole(user.role).includes(
      permissions.leadBeAssigned,
    );
    if (!canBeAssigned) {
      throw new BadRequestException("User cannot be assigned to a lead");
    }
    return { id: user.id, name: user.name };
  }

  async findByIds(ids: string[]): Promise<UserRef[]> {
    if (ids.length === 0) return [];
    return this.prisma.user.findMany({
      where: { id: { in: [...new Set(ids)] } },
      select: { id: true, name: true },
    });
  }

  findByPermission(permission: Permission): Promise<{ id: string }[]> {
    return this.prisma.user.findMany({
      where: { role: { in: getRolesWithPermission(permission) } },
      select: { id: true },
    });
  }

  listAll(): Promise<UserRef[]> {
    return this.prisma.user.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
  }

  private async requireUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException();
    return user;
  }

  private toPublic(user: {
    id: string;
    name: string;
    email: string;
    role: string;
    emailChangedAt: Date | null;
  }): PublicUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailChangedAt: user.emailChangedAt?.toISOString() ?? null,
      nextEmailChangeAt:
        nextEmailChangeAt(user.emailChangedAt, new Date())?.toISOString() ??
        null,
    };
  }

  async getMe(userId: string): Promise<PublicUser> {
    const user = await this.requireUser(userId);
    return this.toPublic(user);
  }

  async updateMe({
    userId,
    name,
    email,
  }: UpdateMePayload): Promise<PublicUser> {
    const user = await this.requireUser(userId);
    const data: {
      name?: string;
      email?: string;
      emailChangedAt?: Date;
    } = {};

    if (name !== undefined) {
      data.name = name.trim();
    }

    if (email !== undefined) {
      const normalizedEmail = email.trim().toLowerCase();
      if (normalizedEmail !== user.email) {
        const unlockAt = nextEmailChangeAt(user.emailChangedAt, new Date());
        if (unlockAt) {
          throw new BadRequestException({
            message: `Email can be changed again on ${unlockAt.toISOString()}`,
            nextChangeAt: unlockAt.toISOString(),
          });
        }
        const taken = await this.prisma.user.findUnique({
          where: { email: normalizedEmail },
        });
        if (taken) {
          throw new ConflictException("Email already exist");
        }
        data.email = normalizedEmail;
        data.emailChangedAt = new Date();
      }
    }
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data,
    });
    return this.toPublic(updated);
  }

  async changePassword({
    userId,
    currentPassword,
    newPassword,
  }: ChangePasswordPayload): Promise<ChangePasswordResponse> {
    const user = await this.requireUser(userId);
    const matches = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!matches) {
      throw new BadRequestException("Current password is incorrect");
    }
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await bcrypt.hash(newPassword, 10) },
    });
    return { ok: true };
  }
}
