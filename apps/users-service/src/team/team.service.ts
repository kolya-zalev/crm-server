import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type {
  TeamInvitePayload,
  TeamMember,
  TeamUpdatePayload,
} from "@app/contracts";
import type { TeamMember as TeamMemberRow } from "../../generated/client";
import { PrismaService } from "../prisma/prisma.service";

const toTeamMember = (row: TeamMemberRow): TeamMember => ({
  id: row.id,
  name: row.name,
  email: row.email,
  role: row.role,
  status: row.status,
  invitedAt: row.invitedAt?.toISOString() ?? null,
  joinedAt: row.joinedAt?.toISOString() ?? null,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

@Injectable()
export class TeamService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<TeamMember[]> {
    const rows = await this.prisma.teamMember.findMany({
      orderBy: { createdAt: "asc" },
    });
    return rows.map(toTeamMember);
  }

  async invite(payload: TeamInvitePayload): Promise<TeamMember> {
    const existing = await this.prisma.teamMember.findUnique({
      where: { email: payload.email },
    });
    if (existing) {
      throw new ConflictException("Email already exists");
    }

    const row = await this.prisma.teamMember.create({
      data: {
        email: payload.email,
        role: payload.role,
        name: "",
        status: "invited",
        invitedAt: new Date(),
      },
    });
    return toTeamMember(row);
  }

  async update({ id, ...data }: TeamUpdatePayload): Promise<TeamMember> {
    const member = await this.prisma.teamMember.findUnique({ where: { id } });
    if (!member) {
      throw new NotFoundException("Member not found");
    }

    const row = await this.prisma.teamMember.update({
      where: { id },
      data,
    });
    return toTeamMember(row);
  }
}
