import { NextAuthConfig } from "next-auth";
import { CollectionSlug } from "payload";

export interface AuthjsPluginConfig {
  /**
   * Enable or disable plugin
   *
   * @default true
   */
  enabled?: boolean;

  /**
   * The slug of the collection that contains the users
   *
   * @default "users"
   */
  userCollectionSlug?: CollectionSlug;

  /**
   * Auth.js configuration
   *
   * @example
   * import { config } from "./auth.config";
   *
   * authjsPlugin({ authjsConfig: config })
   */
  authjsConfig: NextAuthConfig;
}

export interface User {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  emailVerified?: string | null;
  accounts?: Account[] | null;
  sessions?: Session[] | null;
  verificationTokens?: VerificationToken[] | null;
  [key: string]: any;
}

export interface Account {
  id?: string | null;
  provider: string;
  providerAccountId: string;
  type: string;
  [key: string]: any;
}

export interface Session {
  id?: string | null;
  sessionToken: string;
  expires: string;
  [key: string]: any;
}

export interface VerificationToken {
  id?: string | null;
  token: string;
  expires: string;
}
