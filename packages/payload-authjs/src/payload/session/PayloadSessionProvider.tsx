"use client";

import type { CollectionSlug, DataFromCollectionSlug } from "payload";
import { createContext, type ReactNode, useCallback, useEffect, useState } from "react";
import type { PayloadSession } from "./getPayloadSession";

export interface SessionContext<TSlug extends CollectionSlug> {
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

export const Context = createContext<SessionContext<never>>({
  status: "loading",
  session: null,
  refresh: () => new Promise(resolve => resolve(null)),
  refetch: () => new Promise(resolve => resolve(null)),
});

interface Props<TSlug extends CollectionSlug> {
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
export const PayloadSessionProvider: React.FC<Props<CollectionSlug>> = <
  TSlug extends CollectionSlug = "users",
>({
  userCollectionSlug = "users" as TSlug,
  session = null,
  children,
}: Props<TSlug>) => {
  const [isLoading, setIsLoading] = useState(!session);
  const [localSession, setLocalSession] = useState<PayloadSession<TSlug> | null>(session);

  /**
   * Function to fetch the session
   */
  const fetchSession = useCallback(async () => {
    // Fetch the session from the server
    const response = await fetch(`/api/${userCollectionSlug}/me`);
    const result: { user: DataFromCollectionSlug<TSlug>; exp: number } = await response.json();

    // Set loading to false
    setIsLoading(false);

    // If the response is not ok or the user is not present, return null
    if (!response.ok || !result.user) {
      return null;
    }

    // Update the local session
    const localSession = {
      user: result.user,
      expires: new Date(result.exp * 1000).toISOString(),
    };
    setLocalSession(localSession);

    // Return the session
    return localSession;
  }, [userCollectionSlug]);

  /**
   * On mount, fetch the session
   */
  useEffect(() => {
    void fetchSession();
  }, [fetchSession]);

  /**
   * Function to refresh the session
   */
  const refresh = async () => {
    // Refresh the session on the server
    const response = await fetch(`/api/${userCollectionSlug}/refresh-token`, {
      method: "POST",
    });
    const result: { user: DataFromCollectionSlug<TSlug>; exp: number } = await response.json();

    // If the response is not ok or the user is not present, return null
    if (!response.ok || !result.user) {
      return null;
    }

    // Update the local session
    const localSession = {
      user: result.user,
      expires: new Date(result.exp * 1000).toISOString(),
    };
    setLocalSession(localSession);

    // Return the session
    return localSession;
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
