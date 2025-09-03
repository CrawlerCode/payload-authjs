export interface User {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  emailVerified?: string | null;
  accounts?: Account[] | null;
  sessions?: Session[] | null;
  verificationTokens?: VerificationToken[] | null;
  authenticators?: Authenticator[] | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface Account {
  id?: string | null;
  provider: string;
  providerAccountId: string;
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface Session {
  id?: string | null;
  sessionToken: string;
  expires: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface VerificationToken {
  id?: string | null;
  token: string;
  expires: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface Authenticator {
  id?: string | null;
  counter: number;
  credentialBackedUp: boolean;
  credentialID: string;
  credentialPublicKey: string;
  transports?: string | null;
  credentialDeviceType: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

/**
 * Helper type to extract the user type from the collection user type.
 *
 * @example
 * import type { PayloadAuthjsUser } from "payload-authjs";
 * import type { User as PayloadUser } from "@/payload-types";
 *
 * declare module "next-auth" {
 *   interface User extends PayloadAuthjsUser<PayloadUser> {}
 * }
 *
 * @see https://authjs.dev/getting-started/typescript?framework=next-js#module-augmentation
 */
export type PayloadAuthjsUser<User> = Partial<
  Omit<User, "accounts" | "sessions" | "verificationTokens">
>;
