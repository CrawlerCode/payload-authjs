import { headers } from "next/headers.js";
import type { DataFromCollectionSlug } from "payload";
import { cache } from "react";
import type { AUTHJS_STRATEGY_NAME } from "../../constants.js";
import type { AuthCollectionSlug } from "../plugin.js";

interface Options<TSlug extends AuthCollectionSlug> {
  /**
   * The slug of the collection that contains the users
   *
   * @default "users"
   */
  userCollectionSlug?: TSlug;
}

export interface PayloadSession<TSlug extends AuthCollectionSlug> {
  user: {
    collection?: TSlug;
    _strategy?: typeof AUTHJS_STRATEGY_NAME | "local-jwt" | "api-key" | ({} & string);
  } & DataFromCollectionSlug<TSlug>;
  expires?: string;
  collection?: TSlug;
  strategy?: typeof AUTHJS_STRATEGY_NAME | "local-jwt" | "api-key" | ({} & string);
}

/**
 * Get the payload session from the server-side
 *
 * This function is cached to de-duplicate requests:
 * - using React 'cache' function to memorize within the same request (@see https://react.dev/reference/react/cache)
 * - and using Next.js 'data cache' to cache across multiple requests (@see https://nextjs.org/docs/app/building-your-application/caching#data-cache)
 *
 * You can manually invalidate the cache by calling `revalidateTag("payload-session")`
 */
export const getPayloadSession = cache(
  async <TSlug extends AuthCollectionSlug = "users">({
    userCollectionSlug = "users" as TSlug,
  }: Options<TSlug> = {}): Promise<PayloadSession<TSlug> | null> => {
    // Fetch the session from the server
    const requestHeaders = await headers();
    const serverUrl = await getServerUrl(requestHeaders);
    const response = await fetch(`${serverUrl}/api/${userCollectionSlug}/me`, {
      headers: new Headers({
        cookie: requestHeaders.get("cookie") ?? "",
      }),
      cache: "force-cache",
      next: {
        tags: ["payload-session"],
      },
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

    // If the response is not ok or the user is not present, return null
    if (!response.ok || !result.user) {
      return null;
    }

    // Return the session
    return {
      user: result.user,
      expires:
        result.exp && typeof result.exp === "number"
          ? new Date(result.exp * 1000).toISOString()
          : undefined,
      collection: result.collection ?? result.user.collection,
      strategy: result.user._strategy ?? result.strategy, // Extract the strategy from user._strategy or for legacy support directly from the result
    };
  },
);

/**
 * Get the server URL from the environment variables or the request headers
 *
 * The request headers (`Host` / `X-Forwarded-Host` / `X-Forwarded-Proto`) are client-controlled
 * and are therefore only used if the host is explicitly trusted (same semantics as Auth.js `trustHost`).
 *
 * @see https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/lib/utils/env.ts
 */
const getServerUrl = async (requestHeaders: Awaited<ReturnType<typeof headers>>) => {
  // Use the server URL from the environment variables
  const envUrl =
    process.env.NEXT_PUBLIC_SERVER_URL ?? process.env.AUTH_URL ?? process.env.NEXTAUTH_URL;
  if (envUrl) {
    return new URL(envUrl).origin;
  }

  // Only derive the server URL from the request headers if the host is trusted
  if (!isHostTrusted()) {
    throw new Error(
      "payload-authjs: Unable to determine the server URL for getPayloadSession(). " +
        "Set the NEXT_PUBLIC_SERVER_URL or AUTH_URL environment variable, " +
        "or set AUTH_TRUST_HOST=true if your deployment sets the Host / X-Forwarded-Host headers securely.",
    );
  }

  const detectedHost = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  if (!detectedHost) {
    throw new Error("payload-authjs: Unable to determine the server URL (missing Host header).");
  }
  const detectedProtocol = (requestHeaders.get("x-forwarded-proto") ?? "https").replace(/:$/, "");

  return new URL(`${detectedProtocol}://${detectedHost}`).origin;
};

/**
 * Check if the host from the request headers can be trusted
 *
 * - `AUTH_TRUST_HOST` is set: trusted if it is "true" or "1"
 * - Otherwise: trusted on Vercel, Cloudflare Pages or in non-production environments
 */
const isHostTrusted = () => {
  const { AUTH_TRUST_HOST, VERCEL, CF_PAGES, NODE_ENV } = process.env;

  if (AUTH_TRUST_HOST !== undefined) {
    return AUTH_TRUST_HOST === "true" || AUTH_TRUST_HOST === "1";
  }

  return !!VERCEL || !!CF_PAGES || NODE_ENV !== "production";
};
