import { Injectable, Logger } from "@nestjs/common";
import type { Actor } from "../auth/current-user.decorator";
import { NotificationsService } from "../notifications/notifications.service";
import { UsersService } from "../users/users.service";
import { CreateLeadDto, UpdateLeadDto } from "./dto/lead.dto";
import { leadsMessages, permissions } from "@app/contracts";
import { LeadsClient } from "./leads.client";
@Injectable()
export class LeadsFacade {
  private readonly logger = new Logger(LeadsFacade.name);

  constructor(
    private readonly leads: LeadsClient,
    private readonly users: UsersService,
    private readonly notifications: NotificationsService,
  ) {}
  async findAll() {
    return this.attachAssignees(
      await this.leads.send(leadsMessages.leadsFindAll, {}),
    );
  }
  async findOne(id: string) {
    return this.attachAssignee(
      await this.leads.send(leadsMessages.leadsFindOne, { id }),
    );
  }
  async create(dto: CreateLeadDto, actor: Actor) {
    return this.attachAssignee(
      await this.leads.send(leadsMessages.leadsCreate, { actor, data: dto }),
    );
  }
  async remove(id: string) {
    return this.leads.send(leadsMessages.leadsRemove, { id });
  }
  async update(id: string, dto: UpdateLeadDto, actor: Actor) {
    let assignee: { id: string; name: string } | null | undefined;
    if (typeof dto.assignedToId === "string") {
      const canAssign =
        dto.assignedToId === actor.id ||
        actor.permissions.includes(permissions.leadAssign);

      assignee = canAssign
        ? await this.users.getAssignable(dto.assignedToId)
        : { id: dto.assignedToId, name: "" };
    } else if (dto.assignedToId === null) {
      assignee = null;
    }
    const { lead, changes } = await this.leads.send(leadsMessages.leadsUpdate, {
      actor,
      id,
      data: dto,
      assignee,
    });
    await this.sendUpdateNotifications({
      actor,
      lead: { id: lead.id, name: lead.name },
      ...changes,
    });
    return this.attachAssignee(lead);
  }
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
