import { Controller, Get, Query } from "@nestjs/common";
import { AnalyticsService } from "./analytics.service";
import { RequirePermissions } from "../auth/permissions.decorator";
import { EmployeeAnalyticsQueryDto } from "./dto/employee-analytics-query.dto";
import { resolvedPeriod } from "./employee/period";
@Controller("api/analytics")
@RequirePermissions("analytics:view")
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("leads")
  getLeadAnalytics() {
    return this.analyticsService.getLeadAnalytics();
  }
  @Get("employees")
  getEmployeeAnalytics(@Query() query: EmployeeAnalyticsQueryDto) {
    const { from, to } = resolvedPeriod(query);
    return this.analyticsService.getEmployeeAnalytics(from, to);
  }
}
