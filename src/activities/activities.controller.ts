import { Controller, Get, Param } from '@nestjs/common';
import { ActivitiesService } from './activities.service';

@Controller('api/leads/:id/activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get()
  findByLead(@Param('id') leadId: string) {
    return this.activitiesService.findByLead(leadId);
  }
}
