import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

@Injectable()
export class TeamService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.teamMember.findMany({
      orderBy: { createdAt: 'asc' },
    });
  }

  async invite(dto: InviteMemberDto) {
    const existing = await this.prisma.teamMember.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already exists');
    }

    return this.prisma.teamMember.create({
      data: {
        email: dto.email,
        role: dto.role,
        name: '',
        status: 'invited',
        invitedAt: new Date(),
      },
    });
  }

  async update(id: string, dto: UpdateMemberDto) {
    const member = await this.prisma.teamMember.findUnique({ where: { id } });
    if (!member) {
      throw new NotFoundException('Member not found');
    }

    return this.prisma.teamMember.update({
      where: { id },
      data: dto,
    });
  }
}
