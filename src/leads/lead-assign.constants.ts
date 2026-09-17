export const assignableRoles = ["admin", "member"] as const;
export const isAssignableRole = (role: string) =>
  (assignableRoles as readonly string[]).includes(role);
