import { Injectable } from "@nestjs/common";
import {
  closeStatuses,
  openStatuses,
  type AnalyticsEmployeesPayload,
  type AnalyticsLeadsPayload,
  type ClosedByUserRow,
  type EmployeeAnalytics,
  type LeadAnalytics,
  type LeadByUserRow,
  type UserRef,
} from "@app/contracts";
import { PrismaService } from "../prisma/prisma.service";
import {
  dayMs,
  smallSampleThreshold,
  stuckLeadsLimit,
  stuckThresholdDays,
} from "./analytics.constants";
import { buildEmployeeAnalytics } from "./employee/employee-analytics";

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getLeadAnalytics({
    users,
  }: AnalyticsLeadsPayload): Promise<LeadAnalytics> {
    const threshold = new Date(Date.now() - stuckThresholdDays * dayMs);

    const stuckWhere = {
      status: { in: [...openStatuses] },
      statusChangedAt: { lt: threshold },
    };

    const allByStatus = await this.prisma.lead.groupBy({
      by: ["status"],
      _count: { _all: true },
    });

    const won = allByStatus.find((s) => s.status === "won")?._count._all ?? 0;
    const lost = allByStatus.find((s) => s.status === "lost")?._count._all ?? 0;
    const closed = won + lost;

    let open = 0;
    for (const status of openStatuses) {
      const found = allByStatus.find((s) => s.status === status);
      open += found?._count._all ?? 0;
    }

    const winRate = closed === 0 ? 0 : Math.round((won / closed) * 100);

    const stuckByStatus = await this.prisma.lead.groupBy({
      by: ["status"],
      where: stuckWhere,
      _count: { _all: true },
    });

    const stuckNew =
      stuckByStatus.find((s) => s.status === "new")?._count._all ?? 0;
    const stuckContacted =
      stuckByStatus.find((s) => s.status === "contacted")?._count._all ?? 0;
    const stuckQualified =
      stuckByStatus.find((s) => s.status === "qualified")?._count._all ?? 0;

    const stuckLeadsRaw = await this.prisma.lead.findMany({
      where: stuckWhere,
      orderBy: { statusChangedAt: "asc" },
      take: stuckLeadsLimit,
      select: {
        id: true,
        name: true,
        company: true,
        status: true,
        statusChangedAt: true,
      },
    });

    const stuckLeads = stuckLeadsRaw.map((lead) => {
      const daysStuck = Math.floor(
        (Date.now() - lead.statusChangedAt.getTime()) / dayMs,
      );
      return {
        id: lead.id,
        name: lead.name,
        company: lead.company,
        status: lead.status,
        daysStuck,
      };
    });

    const closedBeforeTracking = await this.prisma.lead.count({
      where: { status: { in: [...closeStatuses] }, closedById: null },
    });

    const closedGroups = await this.prisma.lead.groupBy({
      by: ["closedById", "status"],
      where: { closedById: { not: null } },
      _count: { _all: true },
    });

    const unassignedWhere = {
      status: { in: [...openStatuses] },
      assignedToId: null,
    };

    const countUnassigned = await this.prisma.lead.count({
      where: unassignedWhere,
    });

    const unassignedRaw = await this.prisma.lead.findMany({
      where: unassignedWhere,
      orderBy: { statusChangedAt: "asc" },
      take: stuckLeadsLimit,
      select: {
        id: true,
        name: true,
        company: true,
        status: true,
      },
    });

    const closedBy = await this.buildClosedBy(closedGroups, users);

    const leadsByUser = await this.buildLeadsByUser(users);

    return {
      totals: { open, won, lost, closed, winRate },
      unassigned: {
        total: countUnassigned,
        leads: unassignedRaw,
      },
      stuck: {
        thresholdDays: stuckThresholdDays,
        byStatus: {
          new: stuckNew,
          contacted: stuckContacted,
          qualified: stuckQualified,
        },
        leads: stuckLeads,
      },
      closedBy,
      closedBeforeTracking,
      leadsByUser,
    };
  }
  async getEmployeeAnalytics({
    from: fromIso,
    to: toIso,
    users,
  }: AnalyticsEmployeesPayload): Promise<EmployeeAnalytics> {
    const from = new Date(fromIso);
    const to = new Date(toIso);
    const now = new Date();

    const [openLeads, createdLeads, closedLeadsRaw] = await Promise.all([
      this.prisma.lead.findMany({
        where: { status: { in: [...openStatuses] } },
        select: { assignedToId: true, status: true, statusChangedAt: true },
      }),
      this.prisma.lead.findMany({
        where: { createdAt: { gte: from, lt: to } },
        select: { assignedToId: true },
      }),
      this.prisma.lead.findMany({
        where: {
          status: { in: [...closeStatuses] },
          closedAt: { gte: from, lt: to },
        },
        select: {
          closedById: true,
          status: true,
          closedAt: true,
          createdAt: true,
        },
      }),
    ]);
    const closedLeads = closedLeadsRaw.flatMap((lead) =>
      lead.closedAt === null ? [] : [{ ...lead, closedAt: lead.closedAt }],
    );
    const built = buildEmployeeAnalytics({
      users,
      openLeads,
      createdLeads,
      closedLeads,
      now,
      overdueThresholdDays: stuckThresholdDays,
    });
    return {
      period: { from: from.toISOString(), to: to.toISOString() },
      overdueThresholdDays: stuckThresholdDays,
      smallSampleThreshold,
      ...built,
    };
  }
  private async buildLeadsByUser(users: UserRef[]): Promise<LeadByUserRow[]> {
    const groups = await this.prisma.lead.groupBy({
      by: ["assignedToId"],
      _count: { _all: true },
    });

    const rows: LeadByUserRow[] = groups.map((group) => {
      if (!group.assignedToId) {
        return {
          userId: null,
          userName: "Unassigned",
          leadCount: group._count._all,
        };
      }

      const user = users.find((item) => item.id === group.assignedToId);
      return {
        userId: group.assignedToId,
        userName: user?.name ?? "Unknown",
        leadCount: group._count._all,
      };
    });

    rows.sort((a, b) => b.leadCount - a.leadCount);
    return rows;
  }

  private async buildClosedBy(
    groups: {
      closedById: string | null;
      status: string;
      _count: { _all: number };
    }[],
    users: UserRef[],
  ): Promise<ClosedByUserRow[]> {
    const statsByUser = new Map<string, { won: number; lost: number }>();

    for (const group of groups) {
      if (!group.closedById) continue;

      if (!statsByUser.has(group.closedById)) {
        statsByUser.set(group.closedById, { won: 0, lost: 0 });
      }

      const stats = statsByUser.get(group.closedById)!;
      if (group.status === "won") stats.won += group._count._all;
      if (group.status === "lost") stats.lost += group._count._all;
    }

    if (statsByUser.size === 0) return [];


    const result: ClosedByUserRow[] = [];
    for (const [userId, stats] of statsByUser) {
      const user = users.find((u) => u.id === userId);
      result.push({
        userId,
        userName: user?.name ?? "Unknown",
        won: stats.won,
        lost: stats.lost,
        total: stats.won + stats.lost,
      });
    }

    result.sort((a, b) => b.total - a.total);

    return result;
  }
}
