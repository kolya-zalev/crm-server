import { dayMs } from "../analytics.constants";
import type {
  EmployeeAnalyticsRow,
  EmployeeStageCounts,
} from "@app/contracts";

export type EmployeeUserInput = { id: string; name: string };

export type OpenLeadInput = {
  assignedToId: string | null;
  status: string;
  statusChangedAt: Date;
};

export type CreatedLeadInput = { assignedToId: string | null };

export type ClosedLeadInput = {
  closedById: string | null;
  status: string;
  closedAt: Date;
  createdAt: Date;
};

export type BuildEmployeeAnalyticsInput = {
  users: EmployeeUserInput[];
  openLeads: OpenLeadInput[];
  createdLeads: CreatedLeadInput[];
  closedLeads: ClosedLeadInput[];
  now: Date;
  overdueThresholdDays: number;
};

export type BuildEmployeeAnalyticsResult = {
  rows: EmployeeAnalyticsRow[];
  unassigned: EmployeeAnalyticsRow;
  team: EmployeeAnalyticsRow;
};

export const median = (values: number[]): number | null => {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
};

export const average = (values: number[]): number | null => {
  if (values.length === 0) return null;
  const sum = values.reduce((acc, value) => acc + value, 0);
  return sum / values.length;
};

type Bucket = {
  open: number;
  byStage: EmployeeStageCounts;
  overdue: number;
  created: number;
  won: number;
  lost: number;
  wonDurationsDays: number[];
};

const emptyBucket = (): Bucket => ({
  open: 0,
  byStage: { new: 0, contacted: 0, qualified: 0 },
  overdue: 0,
  created: 0,
  won: 0,
  lost: 0,
  wonDurationsDays: [],
});

const isStage = (status: string): status is keyof EmployeeStageCounts =>
  status === "new" || status === "contacted" || status === "qualified";

const toRow = (
  userId: string | null,
  userName: string,
  bucket: Bucket,
): EmployeeAnalyticsRow => {
  const closed = bucket.won + bucket.lost;
  return {
    userId,
    userName,
    open: bucket.open,
    byStage: bucket.byStage,
    overdue: bucket.overdue,
    created: bucket.created,
    won: bucket.won,
    lost: bucket.lost,
    winRate: closed === 0 ? null : Math.round((bucket.won / closed) * 100),
    medianTimeToWinDays: median(bucket.wonDurationsDays),
    avgTimeToWinDays: average(bucket.wonDurationsDays),
    wonSample: bucket.wonDurationsDays.length,
  };
};

export const buildEmployeeAnalytics = ({
  users,
  openLeads,
  createdLeads,
  closedLeads,
  now,
  overdueThresholdDays,
}: BuildEmployeeAnalyticsInput): BuildEmployeeAnalyticsResult => {
  const buckets = new Map<string | null, Bucket>();
  for (const user of users) buckets.set(user.id, emptyBucket());
  buckets.set(null, emptyBucket());
  const team = emptyBucket();

  const bucketFor = (id: string | null): Bucket => {
    const existing = buckets.get(id);
    if (existing) return existing;
    const created = emptyBucket();
    buckets.set(id, created);
    return created;
  };

  const overdueBefore = now.getTime() - overdueThresholdDays * dayMs;

  for (const lead of openLeads) {
    for (const bucket of [bucketFor(lead.assignedToId), team]) {
      bucket.open += 1;
      if (isStage(lead.status)) bucket.byStage[lead.status] += 1;
      if (lead.statusChangedAt.getTime() < overdueBefore) bucket.overdue += 1;
    }
  }

  for (const lead of createdLeads) {
    bucketFor(lead.assignedToId).created += 1;
    team.created += 1;
  }

  for (const lead of closedLeads) {
    for (const bucket of [bucketFor(lead.closedById), team]) {
      if (lead.status === "won") {
        bucket.won += 1;
        const ms = lead.closedAt.getTime() - lead.createdAt.getTime();
        if (ms >= 0) bucket.wonDurationsDays.push(ms / dayMs);
      } else if (lead.status === "lost") {
        bucket.lost += 1;
      }
    }
  }

  const rows = users.map((user) =>
    toRow(user.id, user.name, bucketFor(user.id)),
  );
  rows.sort((a, b) => b.open - a.open || a.userName.localeCompare(b.userName));

  return {
    rows,
    unassigned: toRow(null, "Unassigned", bucketFor(null)),
    team: toRow(null, "Team", team),
  };
};
