import type { NextAuthConfig } from "next-auth";
import type { EnrichedAuthConfig } from "payload-authjs";
import { authConfig } from "./base.config";
import { discordProvider } from "./providers/discord";
import { githubProvider } from "./providers/github";
import { keycloakProvider } from "./providers/keycloak";
import { nodemailerProvider } from "./providers/nodemailer";
import { passkeysProvider } from "./providers/passkeys";

export const nodeAuthConfig: EnrichedAuthConfig<NextAuthConfig> = {
  ...authConfig,
  providers: [
    githubProvider,
    keycloakProvider,
    discordProvider,
    nodemailerProvider,
    passkeysProvider,
  ],
};
