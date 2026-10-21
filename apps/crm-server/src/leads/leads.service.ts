import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateLeadDto, UpdateLeadDto } from "./dto/lead.dto";
import { PrismaService } from "../prisma/prisma.service";
import { isClosedStatus } from "./lead-status.constants";
import type { Actor } from "../auth/current-user.decorator";
import { NotificationsService } from "../notifications/notifications.service";
import { Logger } from "@nestjs/common";
import {
  permissions,
  type Permission,
} from "../../../../libs/contracts/src/permissions.constants";
import { UsersService } from "../users/users.service";

const leadInclude = {
  leadNotes: true,
  activities: true,
  tasks: true,
} as const;
@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly users: UsersService,
  ) {}

  // GET /api/leads
  async findAll() {
    const leads = await this.prisma.lead.findMany({
      include: leadInclude,
    });
    return this.attachAssignees(leads);
  }

  // GET /api/leads/:id
  async findOne(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: leadInclude,
    });
    if (!lead) throw new NotFoundException(`Lead ${id} not found`);
    return this.attachAssignee(lead);
  }

  // POST /api/leads
  async create(dto: CreateLeadDto, actor: Actor) {
    const lead = await this.prisma.lead.create({
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
    return this.attachAssignee(lead);
  }

  // PUT /api/leads/:id
  async update(id: string, dto: UpdateLeadDto, actor: Actor) {
    const { assignedToId, ...rest } = dto;
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

    let nextAssignee: { id: string; name: string } | null | undefined;
    if (assignInPayload && assignedToId !== null) {
      nextAssignee = await this.users.getAssignable(assignedToId);
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
      const [oldAssignee] = await this.users.findByIds(
        oldLead.assignedToId ? [oldLead.assignedToId] : [],
      );
      const from = oldAssignee?.name ?? "Unassigned";
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
      statusChanged,
      closing,
      newStatus: rest.status,
    });
    return this.attachAssignee(updatedLead);
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
  // добавляет assignedTo: { id, name } — имена одним запросом через UsersService
  private async attachAssignees<T extends { assignedToId: string | null }>(
    leads: T[],
  ) {
    const ids = leads.flatMap((lead) =>
      lead.assignedToId ? [lead.assignedToId] : [],
    );
    const users = await this.users.findByIds(ids);
    const usersById = new Map(users.map((user) => [user.id, user]));
    return leads.map((lead) => ({
      ...lead,
      assignedTo: lead.assignedToId
        ? (usersById.get(lead.assignedToId) ?? null)
        : null,
    }));
  }

  private async attachAssignee<T extends { assignedToId: string | null }>(
    lead: T,
  ) {
    const [withAssignee] = await this.attachAssignees([lead]);
    return withAssignee;
  }

  private async sendUpdateNotifications(params: {
    actor: Actor;
    lead: { id: string; name: string };
    assignedChanged: boolean;
    nextAssignee: { id: string; name: string } | null | undefined;
    statusChanged: boolean;
    closing: boolean;
    newStatus?: string;
  }): Promise<void> {
    const {
      actor,
      lead,
      assignedChanged,
      nextAssignee,
      statusChanged,
      closing,
      newStatus,
    } = params;

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

      if (statusChanged && !closing && newStatus) {
        await this.notifications.notifyLeadStatusChanged({
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
