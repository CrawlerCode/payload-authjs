import type { NextAuthConfig } from "next-auth";
import { authConfig } from "./base.config";
import { discordProvider } from "./providers/discord";
import { githubProvider } from "./providers/github";
import { keycloakProvider } from "./providers/keycloak";
import { nodemailerProvider } from "./providers/nodemailer";
import { passkeysProvider } from "./providers/passkeys";

export const nodeAuthConfig: NextAuthConfig = {
  ...authConfig,
  providers: [
    githubProvider,
    keycloakProvider,
    discordProvider,
    nodemailerProvider,
    passkeysProvider,
  ],
};
