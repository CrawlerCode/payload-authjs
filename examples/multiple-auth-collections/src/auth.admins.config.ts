import { NextAuthConfig } from "next-auth";
import github from "next-auth/providers/github";
import { PayloadAuthjsUser } from "payload-authjs";
import { Admin } from "./payload-types";

declare module "next-auth" {
  interface User extends PayloadAuthjsUser<Admin> {}
}

export const adminsAuthConfig: NextAuthConfig = {
  basePath: "/api/auth/admins",
  theme: {
    logo: "https://placehold.co/150x50/transparent/white?text=Admin\\nLogin",
  },
  cookies: {
    sessionToken: {
      name: "authjs.admin-session-token",
    },
    csrfToken: {
      name: "authjs.admin-csrf-token",
    },
    callbackUrl: {
      name: "authjs.admin-callback-url",
    },
  },
  providers: [
    github({
      clientId: process.env.AUTH_ADMINS_GITHUB_ID,
      clientSecret: process.env.AUTH_ADMINS_GITHUB_SECRET,
    }),
  ],
  callbacks: {
    authorized: ({ auth }) => !!auth,
  },
};
