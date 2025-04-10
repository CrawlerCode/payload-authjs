import payloadConfig from "@payload-config";
import NextAuth from "next-auth";
import type { DiscordProfile } from "next-auth/providers/discord";
import type { GitHubProfile } from "next-auth/providers/github";
import { getPayload } from "payload";
import { withPayload } from "payload-authjs";
import { nodeAuthConfig } from "./node.config";

export const { handlers, signIn, signOut, auth } = NextAuth(
  withPayload(nodeAuthConfig, {
    payload: getPayload({ config: payloadConfig }),
    events: {
      /**
       * Update user on every sign in
       */
      signIn: async ({ adapter, user, account, profile }) => {
        if (!user.id || !profile) {
          return;
        }
        await adapter.updateUser!({
          id: user.id,
          ...(account?.provider === "github" && {
            name:
              (profile as unknown as GitHubProfile).name ??
              (profile as unknown as GitHubProfile).login,
            email: profile.email ?? undefined,
            image: (profile as unknown as GitHubProfile).avatar_url,
          }),
          ...(account?.provider === "keycloak" && {
            name: profile.name,
            email: profile.email ?? undefined,
          }),
          ...(account?.provider === "discord" && {
            name: (profile as unknown as DiscordProfile).global_name,
            email: profile.email ?? undefined,
            image: (profile as unknown as DiscordProfile).image_url,
          }),
          additionalUserDatabaseField: `Create by signIn event at ${new Date().toISOString()}`,
        });
      },
    },
  }),
);
