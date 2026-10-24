import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import {
  leadsMessages,
  type ActivityDto,
  type LeadIdPayload,
} from "@app/contracts";
import { ActivitiesService } from "./activities.service";

@Controller()
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @MessagePattern(leadsMessages.activitiesFindByLead)
  findByLead(@Payload() payload: LeadIdPayload): Promise<ActivityDto[]> {
    return this.activitiesService.findByLead(payload);
  }
}
