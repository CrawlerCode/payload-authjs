import { NextAuthConfig } from "next-auth";
import github from "next-auth/providers/github";
import { PayloadAuthjsUser } from "payload-authjs";
import type { User as PayloadUser } from "./payload-types";

declare module "next-auth" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface User extends PayloadAuthjsUser<PayloadUser> {}
}

export const authConfig: NextAuthConfig = {
  providers: [github],
  callbacks: {
    authorized: ({ auth }) => auth?.user && new Date() < new Date(auth.expires),
  },
};
