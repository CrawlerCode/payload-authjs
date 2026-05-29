"use client";

import { use } from "react";
import type { AuthCollectionSlug } from "../plugin.js";
import { Context, type PayloadSessionContext } from "./PayloadSessionProvider.js";

/**
 * Client side hook to retrieve the session from the context provider (PayloadSessionProvider)
 */
export const usePayloadSession = <
  TSlug extends AuthCollectionSlug = "users",
>(): PayloadSessionContext<TSlug> => {
  return use(Context) as PayloadSessionContext<TSlug>;
};
