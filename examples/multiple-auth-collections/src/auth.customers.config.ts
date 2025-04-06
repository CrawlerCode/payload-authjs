import { NextAuthConfig } from "next-auth";
import github from "next-auth/providers/github";
import { PayloadAuthjsUser } from "payload-authjs";
import { Customer } from "./payload-types";

declare module "next-auth" {
  interface User extends PayloadAuthjsUser<Customer> {}
}

export const customersAuthConfig: NextAuthConfig = {
  basePath: "/api/auth/customers",
  theme: {
    logo: "https://placehold.co/150x50/transparent/white?text=Customer\\nLogin",
  },
  cookies: {
    sessionToken: {
      name: "authjs.customer-session-token",
    },
    csrfToken: {
      name: "authjs.customer-csrf-token",
    },
    callbackUrl: {
      name: "authjs.customer-callback-url",
    },
  },
  providers: [
    github({
      clientId: process.env.AUTH_CUSTOMERS_GITHUB_ID,
      clientSecret: process.env.AUTH_CUSTOMERS_GITHUB_SECRET,
    }),
  ],
  callbacks: {
    authorized: ({ auth }) => !!auth,
  },
};
