import jwt from "jsonwebtoken";
import type { NextAuthConfig, Session } from "next-auth";

export const SESSION_STRATEGY: NonNullable<NonNullable<NextAuthConfig["session"]>["strategy"]> =
  "jwt";

export const authConfig: NextAuthConfig = {
  theme: { logo: "https://authjs.dev/img/logo-sm.png" },
  providers: [],
  session: {
    strategy: SESSION_STRATEGY,
    maxAge: 60 * 15, // 15 minutes
    updateAge: 60, // 1 minute
  },
  callbacks: {
    jwt: async ({ token, user, account, trigger }) => {
      //console.log("callbacks.jwt", trigger, token, user, account);

      /**
       * For jwt session strategy, we need to forward additional fields to the token
       */
      if (user) {
        if (user.id) {
          token.id = user.id;
        }
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

      /**
       * Add current account to the token
       */
      if (account) {
        token.currentAccount = {
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          expiresAt: account.expires_at
            ? new Date(account.expires_at * 1000).toISOString()
            : undefined,
          refreshExpiresAt:
            account.refresh_expires_in && typeof account.refresh_expires_in === "number"
              ? new Date(new Date().getTime() + account.refresh_expires_in * 1000).toISOString()
              : undefined,
        };
      }

      /**
       * Refresh access token for keycloak provider
       *
       * @see https://authjs.dev/guides/refresh-token-rotation
       */
      if (
        token.currentAccount?.provider === "keycloak" &&
        // Access token is expired or will expire in 3 minutes
        token.currentAccount.expiresAt &&
        new Date() >=
          new Date(new Date(token.currentAccount.expiresAt).getTime() - 3 * 60 * 1000) &&
        // Refresh token is present and not expired
        token.currentAccount.refreshToken &&
        token.currentAccount.refreshExpiresAt &&
        new Date() < new Date(token.currentAccount.refreshExpiresAt)
      ) {
        try {
          const response = await fetch(
            `${process.env.AUTH_KEYCLOAK_ISSUER}/protocol/openid-connect/token`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams({
                grant_type: "refresh_token",
                client_id: process.env.AUTH_KEYCLOAK_ID!,
                client_secret: process.env.AUTH_KEYCLOAK_SECRET!,
                refresh_token: token.currentAccount.refreshToken,
              }),
            },
          );

          if (!response.ok) {
            throw new Error(
              `Request failed with status ${response.status}: ${response.statusText}`,
            );
          }

          const refreshedTokens = await response.json();

          token.currentAccount.accessToken = refreshedTokens.access_token;
          token.currentAccount.refreshToken = refreshedTokens.refresh_token;
          token.currentAccount.expiresAt = new Date(
            new Date().getTime() + refreshedTokens.expires_in * 1000,
          ).toISOString();
          token.currentAccount.refreshExpiresAt = new Date(
            new Date().getTime() + refreshedTokens.refresh_expires_in * 1000,
          ).toISOString();
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error("Error refreshing access token", error);
        }
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

        session.user.additionalUserVirtualField = token.additionalUserVirtualField;

        session.user.roles = token.roles;

        session.user.currentAccount = token.currentAccount;
      }

      /**
       * If the current account has an expires date, sync the session expires date with it
       */
      const expiresAt = token?.currentAccount?.refreshExpiresAt || token?.currentAccount?.expiresAt;
      if (expiresAt) {
        (session as Session).expires = new Date(expiresAt).toISOString();
      }

      return session;
    },
    authorized: ({ auth }) => {
      // User is authenticated
      if (!auth?.user) {
        return false;
      }

      // Session in not expired
      if (new Date() >= new Date(auth.expires)) {
        return false;
      }

      return true;
    },
  },
  experimental: {
    enableWebAuthn: true,
  },
};
