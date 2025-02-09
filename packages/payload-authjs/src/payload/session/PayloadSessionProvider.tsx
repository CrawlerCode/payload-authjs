"use client";

import type { CollectionSlug, DataFromCollectionSlug } from "payload";
import { createContext, type ReactNode, useState } from "react";
import type { PayloadSession } from "./getPayloadSession";

export interface SessionContext<TSlug extends CollectionSlug> {
  /**
   * The session
   */
  session: PayloadSession<TSlug> | null;
  /**
   * Function to refresh the session
   */
  refresh: () => Promise<PayloadSession<TSlug> | null>;
}

export const Context = createContext<SessionContext<never>>({
  session: null,
  refresh: () => new Promise(resolve => resolve(null)),
});

interface Props<TSlug extends CollectionSlug> {
  /**
   * The slug of the collection that contains the users
   *
   * @default "users"
   */
  userCollectionSlug?: TSlug;
  /**
   * The session (if available)
   */
  session: PayloadSession<TSlug> | null;
  /**
   * The children to render
   */
  children: ReactNode;
}

/**
 * PayloadSessionProvider (client-side) that provides the session to the context provider
 */
export const PayloadSessionProvider = <TSlug extends CollectionSlug = "users">({
  userCollectionSlug = "users" as TSlug,
  session,
  children,
}: Props<TSlug>) => {
  const [localSession, setLocalSession] = useState<PayloadSession<TSlug> | null>(session);

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
        session: localSession,
        refresh,
      }}
    >
      {children}
    </Context>
  );
};
