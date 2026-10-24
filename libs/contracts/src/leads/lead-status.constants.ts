export const openStatuses = ["new", "contacted", "qualified"] as const;
export const closeStatuses = ["won", "lost"] as const;
export const leadStatuses = [...openStatuses, ...closeStatuses] as const;

export type LeadStatus = (typeof leadStatuses)[number];

export const isClosedStatus = (status: string) =>
  (closeStatuses as readonly string[]).includes(status);
