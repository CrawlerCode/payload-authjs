import type { Access } from "payload";

export const hasRole: (role: string) => Access =
  role =>
  ({ req: { user } }) => {
    return user?.roles?.includes(role) ?? false;
  };
