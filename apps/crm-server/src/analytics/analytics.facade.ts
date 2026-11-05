import { Injectable } from "@nestjs/common";
import { leadsMessages } from "@app/contracts";
import { LeadsClient } from "../leads/leads.client";
import { UsersService } from "../users/users.service";

// Аналитику считает leads-service; BFF приносит ему список юзеров (для имён)
@Injectable()
export class AnalyticsFacade {
  constructor(
    private readonly leads: LeadsClient,
    private readonly users: UsersService,
  ) {}

  async getLeadAnalytics() {
    const users = await this.users.listAll();
    return this.leads.send(leadsMessages.analyticsLeads, { users });
  }

  async getEmployeeAnalytics(from: Date, to: Date) {
    const users = await this.users.listAll();
    return this.leads.send(leadsMessages.analyticsEmployees, {
      from: from.toISOString(),
      to: to.toISOString(),
      users,
    });
  }
}
