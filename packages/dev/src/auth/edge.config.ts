import type { NextAuthConfig } from "next-auth";
import { authConfig } from "./base.config";
import { githubProvider } from "./providers/github";
import { keycloakProvider } from "./providers/keycloak";
import { discordProvider } from "./providers/discord";

/**
 * Edge compatible auth config
 *
 * @see https://authjs.dev/guides/edge-compatibility
 */
export const edgeAuthConfig: NextAuthConfig = {
  ...authConfig,
  providers: [githubProvider, keycloakProvider, discordProvider],
};
