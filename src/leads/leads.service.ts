import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateLeadDto, UpdateLeadDto } from "./dto/lead.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { isClosedStatus } from "./lead-status.constants";
import type { Actor } from "src/auth/current-user.decorator";
import { isAssignableRole } from "./lead-assign.constants";
import { NotificationsService } from "src/notifications/notifications.service";
import { Logger } from "@nestjs/common";

const leadInclude = {
  leadNotes: true,
  activities: true,
  tasks: true,
  assignedTo: { select: { id: true, name: true } },
} as const;
@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  // GET /api/leads
  async findAll() {
    return this.prisma.lead.findMany({
      include: leadInclude,
    });
  }

  // GET /api/leads/:id
  async findOne(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: leadInclude,
    });
    if (!lead) throw new NotFoundException(`Lead ${id} not found`);
    return lead;
  }

  // POST /api/leads
  async create(dto: CreateLeadDto, actor: Actor) {
    return this.prisma.lead.create({
      data: {
        ...dto,
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
  }

  // PUT /api/leads/:id
  async update(id: string, dto: UpdateLeadDto, actor: Actor) {
    const { assignedToId, ...rest } = dto;

    const oldLead = await this.prisma.lead.findUnique({
      where: { id },
      include: { assignedTo: { select: { id: true, name: true } } },
    });
    if (!oldLead) throw new NotFoundException(`Lead ${id} not found`);

    const assignInPayload = assignedToId !== undefined;

    if (assignInPayload) {
      if (!isAssignableRole(actor.role)) {
        throw new ForbiddenException("Insufficient permissions");
      }
      if (assignedToId === null && actor.role !== "admin") {
        throw new ForbiddenException("Insufficient permissions");
      }
    }

    let nextAssignee: { id: string; name: string } | null | undefined;
    if (assignInPayload && assignedToId !== null) {
      const user = await this.prisma.user.findUnique({
        where: { id: assignedToId },
        select: { id: true, name: true, role: true },
      });
      if (!user) throw new NotFoundException(`User ${assignedToId} not found`);
      if (!isAssignableRole(user.role)) {
        throw new BadRequestException("User cannot be assigned to a lead");
      }
      nextAssignee = { id: user.id, name: user.name };
    }
    if (assignInPayload && assignedToId === null) nextAssignee = null;

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
      const from = oldLead.assignedTo?.name ?? "Unassigned";
      const to = nextAssignee === null ? "Unassigned" : nextAssignee!.name;
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
        ...(assignedChanged ? { assignedToId: assignedToId ?? null } : {}),
        activities: { create: activities },
      },
      include: leadInclude,
    });

    await this.sendUpdateNotifications({
      actor,
      lead: { id: updatedLead.id, name: updatedLead.name },
      assignedChanged,
      nextAssignee,
      closing,
      newStatus: rest.status,
    });
    return updatedLead;
  }

  // DELETE /api/leads/:id
  async remove(id: string): Promise<void> {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead) throw new NotFoundException(`Lead ${id} not found`);

    await this.prisma.activity.deleteMany({ where: { leadId: id } });
    await this.prisma.note.deleteMany({ where: { leadId: id } });
    await this.prisma.task.deleteMany({ where: { leadId: id } });

    await this.prisma.lead.delete({ where: { id } });
  }

  async addActivity(leadId: string, type: string, description: string) {
    return this.prisma.activity.create({
      data: {
        leadId,
        type,
        description,
      },
    });
  }
  private async sendUpdateNotifications(params: {
    actor: Actor;
    lead: { id: string; name: string };
    assignedChanged: boolean;
    nextAssignee: { id: string; name: string } | null | undefined;
    closing: boolean;
    newStatus?: string;
  }): Promise<void> {
    const { actor, lead, assignedChanged, nextAssignee, closing, newStatus } =
      params;

    try {
      if (assignedChanged && nextAssignee) {
        await this.notifications.notifyLeadAssigned({
          actor,
          assignedId: nextAssignee.id,
          assignedName: nextAssignee.name,
          leadId: lead.id,
          leadName: lead.name,
        });
      }

      if (closing && newStatus) {
        await this.notifications.notifyLeadClosed({
          actor,
          leadId: lead.id,
          leadName: lead.name,
          status: newStatus,
        });
      }
    } catch (error) {
      this.logger.error("Failed to create notifications", error as Error);
    }
  }
}
