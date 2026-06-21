import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role, User, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { InviteDto } from './dto/invite.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

type RequestUser = {
  id: string;
  workspaceId: string;
};

type TeamMember = {
  id: string;
  email: string;
  name: string;
  role: Role;
  status: UserStatus;
  createdAt: Date;
};

@Injectable()
export class TeamService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getMembers(workspaceId: string): Promise<TeamMember[]> {
    const users = await this.prisma.user.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'asc' },
    });

    return users.map((user) => this.sanitizeMember(user));
  }

  async invite(dto: InviteDto, currentUser: RequestUser): Promise<TeamMember> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(randomUUID(), 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        role: dto.role,
        status: UserStatus.invited,
        passwordHash,
        workspaceId: currentUser.workspaceId,
      },
    });

    const inviter = await this.prisma.user.findUnique({
      where: { id: currentUser.id },
    });

    await this.notificationsService.create({
      userId: user.id,
      type: 'team_invited',
      title: 'Team invitation',
      message: `${inviter?.name ?? 'Someone'} invited you to the team`,
    });

    return this.sanitizeMember(user);
  }

  async updateMember(
    id: string,
    dto: UpdateMemberDto,
    currentUser: RequestUser,
  ): Promise<TeamMember> {
    if (dto.role === undefined && dto.status === undefined) {
      throw new BadRequestException('Provide role or status to update');
    }

    const member = await this.prisma.user.findFirst({
      where: { id, workspaceId: currentUser.workspaceId },
    });
    if (!member) {
      throw new NotFoundException('Team member not found');
    }

    if (id === currentUser.id && dto.status === UserStatus.disabled) {
      throw new BadRequestException('Cannot disable your own account');
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.role !== undefined && { role: dto.role }),
        ...(dto.status !== undefined && { status: dto.status }),
      },
    });

    return this.sanitizeMember(user);
  }

  private sanitizeMember(user: User): TeamMember {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    };
  }
}
