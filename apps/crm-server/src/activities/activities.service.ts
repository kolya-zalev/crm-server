import { Injectable } from "@nestjs/common";
import { leadsMessages, type ActivityDto } from "@app/contracts";
import { LeadsClient } from "../leads/leads.client";

@Injectable()
export class ActivitiesService {
  constructor(private readonly leads: LeadsClient) {}

  findByLead(leadId: string): Promise<ActivityDto[]> {
    return this.leads.send(leadsMessages.activitiesFindByLead, { leadId });
  }
}
