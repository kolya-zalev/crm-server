import type { messages } from "./messages";
import type { Permission, Role } from "../permissions.constants";

export type UserRef = { id: string; name: string };

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  emailChangedAt: string | null;
  nextEmailChangeAt: string | null;
};

export type AssignableUser = UserRef & { role: string };

export type TeamMemberStatus = "active" | "invited" | "disabled";

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  invitedAt: string | null;
  joinedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type GetMePayload = { userId: string };

export type UpdateMePayload = { userId: string; name?: string; email?: string };

export type ChangePasswordResponse = { ok: true };

export type GetAssignablePayload = { userId: string };

export type FindByIdsPayload = { ids: string[] };

export type FindByPermissionPayload = { permission: Permission };

export type UpsertUserPayload = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export type TeamInvitePayload = { email: string; role: Role };

export type TeamUpdatePayload = {
  id: string;
  status?: TeamMemberStatus;
  role?: Role;
};

type Empty = Record<string, never>;

export type UsersContract = {
  [messages.usersGetMe]: { payload: GetMePayload; response: PublicUser };
  [messages.usersUpdateMe]: { payload: UpdateMePayload; response: PublicUser };
  [messages.usersListAssignable]: {
    payload: Empty;
    response: AssignableUser[];
  };
  [messages.usersGetAssignable]: {
    payload: GetAssignablePayload;
    response: UserRef;
  };
  [messages.usersFindByIds]: { payload: FindByIdsPayload; response: UserRef[] };
  [messages.usersFindByPermission]: {
    payload: FindByPermissionPayload;
    response: { id: string }[];
  };
  [messages.usersListAll]: { payload: Empty; response: UserRef[] };
  [messages.usersUpsert]: { payload: UpsertUserPayload; response: UserRef };

  [messages.teamFindAll]: { payload: Empty; response: TeamMember[] };
  [messages.teamInvite]: { payload: TeamInvitePayload; response: TeamMember };
  [messages.teamUpdate]: { payload: TeamUpdatePayload; response: TeamMember };
};
