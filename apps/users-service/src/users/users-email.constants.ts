export const EmailChanged = 30 * 24 * 60 * 60 * 1000;

export const nextEmailChangeAt = (
  emailChangedAt: Date | null,
  now: Date,
): Date | null => {
  if (!emailChangedAt) return null;
  const unlockAt = new Date(emailChangedAt.getTime() + EmailChanged);
  return now >= unlockAt ? null : unlockAt;
};
