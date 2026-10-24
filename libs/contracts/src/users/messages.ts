export const messages = {
  authRegister: "auth.register",
  authLogin: "auth.login",

  usersGetMe: "users.getMe",
  usersUpdateMe: "users.updateMe",
  usersChangePassword: "users.changePassword",
  usersListAssignable: "users.listAssignable",
  usersGetAssignable: "users.getAssignable",
  usersFindByIds: "users.findByIds",
  usersFindByPermission: "users.findByPermission",
  usersListAll: "users.listAll",

  teamFindAll: "team.findAll",
  teamInvite: "team.invite",
  teamUpdate: "team.update",
} as const;

export type Message = (typeof messages)[keyof typeof messages];
