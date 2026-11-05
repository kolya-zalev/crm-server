import { Permission } from "./permissions.constants";
export type Actor = {
  id: string;
  name: string;
  role: string;
  permissions: Permission[];
};
