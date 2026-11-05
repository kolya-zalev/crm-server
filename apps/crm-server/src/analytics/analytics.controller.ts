import { Controller, Get, Query } from "@nestjs/common";
import { RequirePermissions } from "../auth/permissions.decorator";
import { EmployeeAnalyticsQueryDto } from "./dto/employee-analytics-query.dto";
import { resolvedPeriod } from "./employee/period";
import { AnalyticsFacade } from "./analytics.facade";

@Controller("api/analytics")
@RequirePermissions("analytics:view")
export class AnalyticsController {
  constructor(private readonly analyticsFacade: AnalyticsFacade) {}

  @Get("leads")
  getLeadAnalytics() {
    return this.analyticsFacade.getLeadAnalytics();
  }

  @Get("employees")
  getEmployeeAnalytics(@Query() query: EmployeeAnalyticsQueryDto) {
    const { from, to } = resolvedPeriod(query);
    return this.analyticsFacade.getEmployeeAnalytics(from, to);
  }
}
