import type { Access } from "payload";

export const authenticated: Access = ({ req: { user } }) => {
  if (user) {
    return true;
  }
  return false;
};
