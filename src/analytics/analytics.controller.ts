import { Controller, Get } from "@nestjs/common";
import { AnalyticsService } from "./analytics.service";
import { Roles } from "src/auth/roles.decorator";

@Controller("api/analytics")
@Roles("admin")
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("leads")
  getLeadAnalytics() {
    return this.analyticsService.getLeadAnalytics();
  }
}
