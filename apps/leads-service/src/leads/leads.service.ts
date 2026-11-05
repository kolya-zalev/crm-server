import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  isClosedStatus,
  permissions,
  type CreateLeadPayload,
  type FindLeadPayload,
  type LeadChanges,
  type LeadDto,
  type OkResponse,
  type Permission,
  type RemoveLeadPayload,
  type UpdateLeadPayload,
  type UpdateLeadResponse,
} from "@app/contracts";
import { PrismaService } from "../prisma/prisma.service";
import { toLeadDto } from "./leads.mapper";

const leadInclude = {
  leadNotes: true,
  activities: true,
  tasks: true,
} as const;

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<LeadDto[]> {
    const leads = await this.prisma.lead.findMany({
      include: leadInclude,
    });
    return leads.map(toLeadDto);
  }

  async findOne({ id }: FindLeadPayload): Promise<LeadDto> {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: leadInclude,
    });
    if (!lead) throw new NotFoundException(`Lead ${id} not found`);
    return toLeadDto(lead);
  }

  async create({ actor, data }: CreateLeadPayload): Promise<LeadDto> {
    const lead = await this.prisma.lead.create({
      data: {
        ...data,
        activities: {
          create: {
            type: "lead_created",
            description: "Lead was created",
            userId: actor.id,
            userName: actor.name,
          },
        },
      },
      include: leadInclude,
    });
    return toLeadDto(lead);
  }

  async update({
    actor,
    id,
    data,
    assignee,
  }: UpdateLeadPayload): Promise<UpdateLeadResponse> {
    const { assignedToId, ...rest } = data;
    const oldLead = await this.prisma.lead.findUnique({ where: { id } });
    if (!oldLead) throw new NotFoundException(`Lead ${id} not found`);

    const has = (permission: Permission) =>
      actor.permissions.includes(permission);

    if (!has(permissions.leadUpdate)) {
      const changesOtherFields = Object.entries(rest).some(
        ([key, value]) => key !== "status" && value !== undefined,
      );
      if (changesOtherFields) {
        throw new ForbiddenException("You cannot change this lead");
      }
      if (rest.status === undefined && assignedToId === undefined) {
        throw new ForbiddenException("You cannot change this lead");
      }
    }

    const assignInPayload = assignedToId !== undefined;

    if (assignInPayload) {
      if (assignedToId === null) {
        if (!has(permissions.leadUnassign)) {
          throw new ForbiddenException("Insufficient permissions");
        }
      } else if (assignedToId === actor.id) {
        const leadIsFreeOrMine =
          oldLead.assignedToId === null || oldLead.assignedToId === actor.id;
        const canTake = has(permissions.leadTake) && leadIsFreeOrMine;
        if (!has(permissions.leadAssign) && !canTake) {
          throw new ForbiddenException("You cannot change this lead");
        }
      } else if (!has(permissions.leadAssign)) {
        throw new ForbiddenException("You cannot change this lead");
      }
    }

    if (assignInPayload && assignedToId === null) assignee = null;

    const assignedChanged =
      assignInPayload && assignedToId !== (oldLead.assignedToId ?? null);

    const statusChanged = !!rest.status && rest.status !== oldLead.status;

    const activities: {
      type: string;
      description: string;
      userId: string;
      userName: string;
    }[] = [];

    if (statusChanged) {
      activities.push({
        type: "status_changed",
        description: `${oldLead.status} → ${rest.status}`,
        userId: actor.id,
        userName: actor.name,
      });
    }

    if (assignedChanged) {
      const from = oldLead.assignedToName ?? "Unassigned";
      const to = assignee?.name ?? "Unassigned";
      activities.push({
        type: "assigned",
        description: `${from} → ${to}`,
        userId: actor.id,
        userName: actor.name,
      });
    }

    if (activities.length === 0) {
      activities.push({
        type: "lead_updated",
        description: "Lead was updated",
        userId: actor.id,
        userName: actor.name,
      });
    }

    const closing = statusChanged && isClosedStatus(rest.status!);
    const statusFields = statusChanged
      ? {
          statusChangedAt: new Date(),
          closedAt: closing ? new Date() : null,
          closedById: closing ? actor.id : null,
        }
      : {};

    const updatedLead = await this.prisma.lead.update({
      where: { id },
      data: {
        ...rest,
        ...statusFields,
        ...(assignedChanged
          ? {
              assignedToId: assignedToId ?? null,
              assignedToName: assignee?.name ?? null,
            }
          : {}),
        activities: { create: activities },
      },
      include: leadInclude,
    });

    return {
      lead: toLeadDto(updatedLead),
      changes: {
        assignedChanged,
        nextAssignee: assignee,
        statusChanged,
        closing,
        newStatus: rest.status,
      } satisfies LeadChanges,
    };
  }

  async remove({ id }: RemoveLeadPayload): Promise<OkResponse> {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead) throw new NotFoundException(`Lead ${id} not found`);
    await this.prisma.lead.delete({ where: { id } });
    return { ok: true };
  }
}
