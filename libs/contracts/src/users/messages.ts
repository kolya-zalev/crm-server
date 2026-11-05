export const messages = {
  usersGetMe: "users.getMe",
  usersUpdateMe: "users.updateMe",
  usersListAssignable: "users.listAssignable",
  usersGetAssignable: "users.getAssignable",
  usersFindByIds: "users.findByIds",
  usersFindByPermission: "users.findByPermission",
  usersListAll: "users.listAll",
  usersUpsert: "users.upsert",

  teamFindAll: "team.findAll",
  teamInvite: "team.invite",
  teamUpdate: "team.update",
} as const;

export type Message = (typeof messages)[keyof typeof messages];
