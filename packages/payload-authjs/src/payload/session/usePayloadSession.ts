"use client";

import type { CollectionSlug } from "payload";
import { use } from "react";
import { Context, type SessionContext } from "./PayloadSessionProvider";

/**
 * Client side hook to retrieve the session from the context provider (PayloadSessionProvider)
 */
export const usePayloadSession = <TSlug extends CollectionSlug = "users">() => {
  return use<SessionContext<TSlug>>(Context);
};
