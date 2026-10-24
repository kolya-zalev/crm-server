import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import {
  leadsMessages,
  type AnalyticsEmployeesPayload,
  type AnalyticsLeadsPayload,
  type EmployeeAnalytics,
  type LeadAnalytics,
} from "@app/contracts";
import { AnalyticsService } from "./analytics.service";

@Controller()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @MessagePattern(leadsMessages.analyticsLeads)
  getLeadAnalytics(
    @Payload() payload: AnalyticsLeadsPayload,
  ): Promise<LeadAnalytics> {
    return this.analyticsService.getLeadAnalytics(payload);
  }

  @MessagePattern(leadsMessages.analyticsEmployees)
  getEmployeeAnalytics(
    @Payload() payload: AnalyticsEmployeesPayload,
  ): Promise<EmployeeAnalytics> {
    return this.analyticsService.getEmployeeAnalytics(payload);
  }
}
