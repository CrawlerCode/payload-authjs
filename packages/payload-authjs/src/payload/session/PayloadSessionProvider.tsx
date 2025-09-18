"use client";

import type { DataFromCollectionSlug } from "payload";
import { createContext, type ReactNode, useCallback, useEffect, useState } from "react";
import type { AUTHJS_STRATEGY_NAME } from "../../constants";
import type { AuthCollectionSlug } from "../plugin";
import type { PayloadSession } from "./getPayloadSession";

export interface PayloadSessionContext<TSlug extends AuthCollectionSlug = AuthCollectionSlug> {
  /**
   * The status of the session
   */
  status: "loading" | "authenticated" | "unauthenticated";
  /**
   * The session
   */
  session: PayloadSession<TSlug> | null;
  /**
   * Function to refresh the session
   */
  refresh: () => Promise<PayloadSession<TSlug> | null>;
  /**
   * Function to refetch the session from the server
   */
  refetch: () => Promise<PayloadSession<TSlug> | null>;
}

export const Context = createContext<PayloadSessionContext>({
  status: "loading",
  session: null,
  refresh: () => Promise.resolve(null),
  refetch: () => Promise.resolve(null),
});

interface Props<TSlug extends AuthCollectionSlug> {
  /**
   * The slug of the collection that contains the users
   *
   * @default "users"
   */
  userCollectionSlug?: TSlug;
  /**
   * The session from the server
   *
   * @default null
   */
  session?: PayloadSession<TSlug> | null;
  /**
   * The children to render
   */
  children: ReactNode;
}

/**
 * PayloadSessionProvider that provides the session to the context provider
 */
export const PayloadSessionProvider = <TSlug extends AuthCollectionSlug = "users">({
  userCollectionSlug = "users" as TSlug,
  session = null,
  children,
}: Props<TSlug>) => {
  const [isLoading, setIsLoading] = useState(!session);
  const [localSession, setLocalSession] = useState<PayloadSession<TSlug> | null>(session);

  /**
   * Function to fetch the session
   */
  const fetchSession = useCallback(
    async ({ signal }: { signal?: AbortSignal } = {}) => {
      /**
       * Fetch the session from the server
       *
       * @see https://payloadcms.com/docs/rest-api/overview#auth-operations
       */
      const response = await fetch(`/api/${userCollectionSlug}/me`, {
        signal,
      });
      const result: {
        user:
          | ({
              collection?: TSlug;
              _strategy?: typeof AUTHJS_STRATEGY_NAME | "local-jwt" | "api-key" | ({} & string);
            } & DataFromCollectionSlug<TSlug>)
          | null;
        exp?: number;
        collection?: TSlug;
        /**
         * @deprecated Use user._strategy instead
         *
         * @see https://github.com/payloadcms/payload/pull/11701
         */
        strategy?: string;
      } = await response.json();

      // Set loading to false
      setIsLoading(false);

      // If the response is ok
      if (response.ok && result.user) {
        // Update the local session
        const localSession = {
          user: result.user,
          expires:
            result.exp && typeof result.exp === "number"
              ? new Date(result.exp * 1000).toISOString()
              : undefined,
          collection: result.collection ?? result.user.collection,
          strategy: result.user._strategy ?? result.strategy, // Extract the strategy from user._strategy or for legacy support directly from the result
        };
        setLocalSession(localSession);

        // Return the session
        return localSession;
      } else {
        // Reset the session
        setLocalSession(null);

        return null;
      }
    },
    [userCollectionSlug],
  );

  /**
   * On mount, fetch the session
   */
  useEffect(() => {
    const abortController = new AbortController();

    void fetchSession({
      signal: abortController.signal,
    });

    // Abort the fetch on unmount
    return () => {
      abortController.abort();
    };
  }, [fetchSession]);

  /**
   * Function to refresh the session
   */
  const refresh = async () => {
    /**
     * Refresh the session on the server
     *
     * @see https://payloadcms.com/docs/rest-api/overview#auth-operations
     */
    const response = await fetch(`/api/${userCollectionSlug}/refresh-token`, {
      method: "POST",
    });
    const result: {
      user:
        | ({
            collection?: TSlug;
            _strategy?: typeof AUTHJS_STRATEGY_NAME | "local-jwt" | "api-key" | ({} & string);
          } & DataFromCollectionSlug<TSlug>)
        | null;
      exp?: number;
      /**
       * @deprecated Use user._strategy instead
       *
       * @see https://github.com/payloadcms/payload/pull/11701
       */
      strategy?: string;
    } = await response.json();

    if (response.ok && result.user) {
      // Update the local session
      const localSession = {
        user: result.user,
        expires:
          result.exp && typeof result.exp === "number"
            ? new Date(result.exp * 1000).toISOString()
            : undefined,
        collection: result.user.collection,
        strategy: result.user._strategy ?? result.strategy, // Extract the strategy from user._strategy or for legacy support directly from the result
      };
      setLocalSession(localSession);

      // Return the session
      return localSession;
    } else {
      // Reset the session
      setLocalSession(null);

      return null;
    }
  };

  return (
    <Context
      value={{
        status: isLoading ? "loading" : localSession ? "authenticated" : "unauthenticated",
        session: localSession,
        refresh,
        refetch: fetchSession,
      }}
    >
      {children}
    </Context>
  );
};
