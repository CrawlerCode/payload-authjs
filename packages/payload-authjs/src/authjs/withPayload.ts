import type { NextAuthConfig } from "next-auth";
import type { Adapter } from "next-auth/adapters";
import type { Payload } from "payload";
import { deepCopyObjectSimple, getPayload } from "payload";
import { PayloadAdapter, type PayloadAdapterOptions } from "./PayloadAdapter";

type CustomEvent<T extends keyof NonNullable<NextAuthConfig["events"]>> = (
  message: {
    /**
     * The Auth.js database adapter
     */
    adapter: Adapter;
    /**
     * The payload instance
     */
    payload?: Payload;
  } & Parameters<NonNullable<NonNullable<NextAuthConfig["events"]>[T]>>[0],
) => void | PromiseLike<void>;

export interface WithPayloadOptions extends PayloadAdapterOptions {
  /**
   * Update the user after every sign in
   *
   * @deprecated updateUserOnSignIn is deprecated and will be removed in the future. Use events.signIn instead
   *
   * @default false
   */
  updateUserOnSignIn?: boolean;
  /**
   * Auth.js events
   * All events from authjs will be forwarded and enriched with additional parameters like the adapter and the payload instance
   *
   * @see https://authjs.dev/reference/nextjs#events
   */
  events?: {
    /**
     * Sign in event
     */
    signIn?: CustomEvent<"signIn">;
    /**
     * Sign out event
     */
    signOut?: CustomEvent<"signOut">;
    /**
     * Create user event
     */
    createUser?: CustomEvent<"createUser">;
    /**
     * Update user event
     */
    updateUser?: CustomEvent<"updateUser">;
    /**
     * Link account event
     */
    linkAccount?: CustomEvent<"linkAccount">;
    /**
     * Session event
     */
    session?: CustomEvent<"session">;
  };
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
  { updateUserOnSignIn, events, ...options }: WithPayloadOptions,
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

  // Forward all events from authjs and enrich them with additional parameters
  const originalEvents = deepCopyObjectSimple(authjsConfig.events ?? {});
  authjsConfig.events = Object.entries(events ?? {}).reduce((result, [key, customEvent]) => {
    const originalEvent = result[key as keyof typeof result];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result[key as keyof typeof result] = async (message: any) => {
      // Call the original event
      await originalEvent?.(message);

      // Call the custom event
      await customEvent?.({
        ...message,
        // Add the adapter to the event
        adapter: authjsConfig.adapter,
        // Add payload to the event
        payload: options.payload
          ? await options.payload
          : options.payloadConfig
            ? await getPayload({ config: options.payloadConfig })
            : undefined,
      });
    };

    return result;
  }, originalEvents);

  return authjsConfig;
}
