import jwt from "jsonwebtoken";
import type { NextAuthConfig } from "next-auth";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { JWT } from "next-auth/jwt";
import github from "next-auth/providers/github";
import keycloak from "next-auth/providers/keycloak";
import nodemailer from "next-auth/providers/nodemailer";
import type { User as PayloadUser } from "payload/generated-types";

declare module "next-auth" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface User
    extends Partial<Omit<PayloadUser, "accounts" | "sessions" | "verificationTokens">> {}
}
declare module "next-auth/jwt" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface JWT
    extends Partial<
      Pick<
        PayloadUser,
        "id" | "additionalUserDatabaseField" | "additionalUserVirtualField" | "roles"
      >
    > {}
}

export const authConfig: NextAuthConfig = {
  theme: { logo: "https://authjs.dev/img/logo-sm.png" },
  providers: [
    github({
      allowDangerousEmailAccountLinking: true,
      /**
       * Add additional fields to the user on first sign in
       */
      profile(profile) {
        return {
          // Default fields (@see https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/github.ts#L176)
          id: profile.id.toString(),
          name: profile.name ?? profile.login,
          email: profile.email!,
          image: profile.avatar_url,
          // Custom fields
          additionalUserDatabaseField: `Create by github provider profile callback at ${new Date().toISOString()}`,
        };
      },
      account(tokens) {
        return {
          ...tokens,
          additionalAccountDatabaseField: `Create by github provider profile callback at ${new Date().toISOString()}`,
        };
      },
    }),
    keycloak({
      allowDangerousEmailAccountLinking: true,
      /**
       * Add additional fields to the user on first sign in
       */
      profile(profile) {
        return {
          // Default fields
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          // Custom fields
          locale: profile.locale,
          additionalUserDatabaseField: `Create by keycloak provider profile callback at ${new Date().toISOString()}`,
        };
      },
      account(tokens) {
        return {
          ...tokens,
          additionalAccountDatabaseField: `Create by keycloak provider profile callback at ${new Date().toISOString()}`,
        };
      },
    }),
    nodemailer({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
      /* sendVerificationRequest: ({ url }) => {
        console.log("nodemailer:", url);
      }, */
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt: ({ token, user, account, trigger }) => {
      //console.log("callbacks.jwt", token, user, account);

      /**
       * For jwt session strategy, we need to forward additional fields to the token
       */
      if (user) {
        if (user.id) {
          token.id = user.id;
        }
        token.additionalUserDatabaseField = user.additionalUserDatabaseField;
      }

      // Add virtual field to the token
      token.additionalUserVirtualField = `Create by jwt callback at ${new Date().toISOString()}`;

      /**
       * Add roles to the token
       * - Extract roles from the token for keycloak provider
       * - otherwise use default roles ["user"]
       */
      if (trigger === "signIn" || trigger === "signUp") {
        const roles: string[] = ["user"];
        if (account?.provider === "keycloak" && account.access_token) {
          const decodedToken = jwt.decode(account.access_token);
          if (decodedToken && typeof decodedToken !== "string") {
            roles.push(
              ...(decodedToken.resource_access?.[process.env.AUTH_KEYCLOAK_ID!]?.roles ?? []),
            );
          }
        }
        token.roles = [...new Set(roles)];
      }

      return token;
    },
    session: ({ session, token }) => {
      //console.log("callbacks.session", session, user, token);

      /**
       * For jwt session strategy, we need to forward additional fields to the session
       */
      if (token) {
        if (token.id) {
          session.user.id = token.id;
        }

        session.user.additionalUserDatabaseField = token.additionalUserDatabaseField;
        session.user.additionalUserVirtualField = token.additionalUserVirtualField;

        session.user.roles = token.roles;
      }

      return session;
    },
    authorized: ({ auth }) => {
      // Logged in users are authenticated, otherwise redirect to login page
      return !!auth;
    },
  },
  /* events: {
    signIn: () => {
      console.log("original events.signIn");
    },
  }, */
};
