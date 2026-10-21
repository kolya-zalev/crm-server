export const openStatuses = ["new", "contacted", "qualified"] as const;
export const closeStatuses = ["won", "lost"] as const;

export const isClosedStatus = (status: string) =>
  (closeStatuses as readonly string[]).includes(status);
