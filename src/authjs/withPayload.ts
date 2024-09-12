/* eslint-disable no-param-reassign */
import type { NextAuthConfig } from "next-auth";
import { PayloadAdapter, type PayloadAdapterOptions } from "./PayloadAdapter";

export interface WithPayloadOptions extends PayloadAdapterOptions {
  /**
   * Update the user after every sign in
   *
   * @default false
   */
  updateUserOnSignIn?: boolean;
}

/**
 * Wraps the Auth.js configuration
 *
 * @example
 * import { config } from "./auth.config";
 *
 * export const { handlers, signIn, signOut, auth } = NextAuth(() =>
 *   withPayload(config, { payloadConfig }),
 * );
 */
export function withPayload(
  authjsConfig: NextAuthConfig,
  { updateUserOnSignIn, ...options }: WithPayloadOptions,
): NextAuthConfig {
  authjsConfig = { ...authjsConfig };

  // Set default session strategy to "jwt"
  authjsConfig.session = {
    ...authjsConfig.session,
    strategy: authjsConfig.session?.strategy || "jwt",
  };

  // Register the Payload adapter for authjs
  authjsConfig.adapter = PayloadAdapter(options);

  /**
   * Update the user profile after every sign in
   * This is useful when you add new fields to the user collection (e.g. roles)
   * @see https://authjs.dev/guides/role-based-access-control#with-database
   */
  if (updateUserOnSignIn === true) {
    const { signIn, ...callbacks } = authjsConfig.callbacks ?? {};
    // eslint-disable-next-line no-inner-declarations
    async function updateUserOnSignInWrapper(
      params: Parameters<NonNullable<typeof signIn>>[0],
    ): Promise<boolean> {
      // Call the original signIn callback
      if ((await signIn?.(params)) === false) {
        return false;
      }
      // Try to update the user profile
      try {
        if (params.user.id && params.profile) {
          await authjsConfig.adapter?.updateUser?.({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ...(params.profile as any),
            id: params.user.id,
          });
        }
      } catch {
        // If user signed in the first time, the user is not found in the database and an error is thrown
      }
      return true;
    }
    authjsConfig.callbacks = {
      ...callbacks,
      // Prevent injecting the same wrapper multiple times
      signIn: signIn?.name !== "updateUserOnSignInWrapper" ? updateUserOnSignInWrapper : signIn,
    };
  }

  return authjsConfig;
}
