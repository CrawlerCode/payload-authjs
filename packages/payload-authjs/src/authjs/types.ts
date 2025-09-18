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
  Omit<User, "accounts" | "sessions" | "verificationTokens" | "authenticators">
>;
