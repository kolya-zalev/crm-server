import { BadRequestException } from "@nestjs/common";

export type Period = { from: Date; to: Date };

export const resolvedPeriod = (
  query: { from?: string; to?: string },
  now = new Date(),
): Period => {
  const from = query.from
    ? new Date(query.from)
    : new Date(now.getFullYear(), now.getMonth(), 1);
  const to = query.to
    ? new Date(query.to)
    : new Date(now.getFullYear(), now.getMonth() + 1, 1);

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    throw new BadRequestException("Invalid period");
  }
  if (from.getTime() >= to.getTime()) {
    throw new BadRequestException("from must be before to");
  }
  return { from, to };
};
