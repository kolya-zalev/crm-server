export type StuckLead = {
  id: string;
  name: string;
  company: string;
  status: string;
  daysStuck: number;
};

export type ClosedByUserRow = {
  userId: string;
  userName: string;
  won: number;
  lost: number;
  total: number;
};

export type UnassignedLead = {
  id: string;
  name: string;
  company: string;
  status: string;
};
export type LeadByUserRow = {
  userId: string | null;
  userName: string;
  leadCount: number;
};

export type LeadAnalytics = {
  totals: {
    open: number;
    won: number;
    lost: number;
    closed: number;
    winRate: number;
  };
  unassigned: {
    total: number;
    leads: UnassignedLead[];
  };
  stuck: {
    thresholdDays: number;
    byStatus: {
      new: number;
      contacted: number;
      qualified: number;
    };
    leads: StuckLead[];
  };
  closedBy: ClosedByUserRow[];
  closedBeforeTracking: number;
  leadsByUser: LeadByUserRow[];
};

export type EmployeeStageCounts = {
  new: number;
  contacted: number;
  qualified: number;
};

export type EmployeeAnalyticsRow = {
  userId: string | null;
  userName: string;
  open: number;
  byStage: EmployeeStageCounts;
  overdue: number;
  created: number;
  won: number;
  lost: number;
  winRate: number | null;
  medianTimeToWinDays: number | null;
  avgTimeToWinDays: number | null;
  wonSample: number;
};

export type EmployeeAnalytics = {
  period: { from: string; to: string };
  overdueThresholdDays: number;
  smallSampleThreshold: number;
  rows: EmployeeAnalyticsRow[];
  unassigned: EmployeeAnalyticsRow;
  team: EmployeeAnalyticsRow;
};
