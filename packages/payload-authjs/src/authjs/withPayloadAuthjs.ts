import type { NextAuthConfig } from "next-auth";
import type { Adapter } from "next-auth/adapters";
import type { Payload } from "payload";
import type { AuthCollectionSlug } from "../payload/plugin";
import { PayloadAdapter } from "./PayloadAdapter";

/**
 * An enriched version of the NextAuthConfig that includes the payload instance and database adapter in event callbacks
 */
export type EnrichedAuthConfig<TConfig extends NextAuthConfig = NextAuthConfig> = {
  events?: EnrichedEvents<TConfig>;
} & Omit<TConfig, "events">;

type EnrichedEvents<TConfig extends NextAuthConfig> = {
  [EventName in keyof NonNullable<NextAuthConfig["events"]>]?: (
    message: {
      /**
       * The Auth.js database adapter
       */
      adapter?: Adapter;
      /**
       * The payload instance
       */
      payload?: Payload;
    } & Parameters<NonNullable<NonNullable<TConfig["events"]>[EventName]>>[0],
  ) => void | PromiseLike<void>;
};

/**
 * Setup Auth.js configuration
 *
 * - Register the Payload adapter for Auth.js
 * - Set default session strategy to "jwt" if not already set
 * - Enrich the Auth.js configuration by wrapping event callbacks to include the payload instance and database adapter
 */
export const withPayloadAuthjs = ({
  payload,
  config,
  collectionSlug,
}: {
  payload: Payload;
  config: EnrichedAuthConfig<NextAuthConfig>;
  collectionSlug: AuthCollectionSlug;
}): NextAuthConfig => {
  const adapter = PayloadAdapter({
    payload,
    userCollectionSlug: collectionSlug,
  });

  return {
    ...config,
    session: {
      ...config.session,
      // Set default session strategy to "jwt"
      strategy: config.session?.strategy || "jwt",
    },
    // Register the Payload adapter for authjs
    adapter,
    ...(config.events && {
      // Enrich event callbacks to include the payload instance and adapter
      events: Object.entries(config.events).reduce(
        (events, [eventName, callback]) => {
          events[eventName as keyof EnrichedEvents<NextAuthConfig>] = message =>
            callback({
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ...(message as any),
              // Add the payload instance and the adapter
              payload,
              adapter,
            });
          return events;
        },
        {} as NonNullable<NextAuthConfig["events"]>,
      ),
    }),
  };
};
