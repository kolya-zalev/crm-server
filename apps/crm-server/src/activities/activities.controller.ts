import { Controller, Get, Param } from "@nestjs/common";
import { ActivitiesService } from "./activities.service";
import { RequirePermissions } from "../auth/permissions.decorator";

@Controller("api/leads/:id/activities")
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get()
  @RequirePermissions("lead:read")
  findByLead(@Param("id") leadId: string) {
    return this.activitiesService.findByLead(leadId);
  }
}
