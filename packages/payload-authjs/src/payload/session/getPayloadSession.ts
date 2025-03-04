import { headers } from "next/headers";
import type { CollectionSlug, DataFromCollectionSlug } from "payload";
import { cache } from "react";
import type { AUTHJS_STRATEGY_NAME } from "../AuthjsAuthStrategy";

interface Options<TSlug extends CollectionSlug> {
  /**
   * The slug of the collection that contains the users
   *
   * @default "users"
   */
  userCollectionSlug?: TSlug;
}

export interface PayloadSession<TSlug extends CollectionSlug> {
  user: DataFromCollectionSlug<TSlug>;
  expires: string;
  collection?: CollectionSlug;
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
  async <TSlug extends CollectionSlug = "users">({
    userCollectionSlug = "users" as TSlug,
  }: Options<TSlug> = {}): Promise<PayloadSession<TSlug> | null> => {
    // Get the server URL
    const serverUrl = await getServerUrl();

    // Fetch the session from the server
    const response = await fetch(`${serverUrl}/api/${userCollectionSlug}/me`, {
      headers: await headers(),
      cache: "force-cache",
      next: {
        tags: ["payload-session"],
      },
    });
    const result: {
      user: DataFromCollectionSlug<TSlug> | null;
      exp: number;
      collection?: CollectionSlug;
      strategy?: string;
    } = await response.json();

    // If the response is not ok or the user is not present, return null
    if (!response.ok || !result.user) {
      return null;
    }

    // Return the session
    return {
      user: result.user,
      expires: new Date(result.exp * 1000).toISOString(),
      collection: result.collection,
      strategy: result.strategy,
    };
  },
);

/**
 * Get the server URL from the environment variables or the request headers
 */
const getServerUrl = async () => {
  let serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

  if (!serverUrl) {
    const requestHeaders = await headers();

    const detectedHost = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
    const detectedProtocol = requestHeaders.get("x-forwarded-proto") ?? "https";
    const protocol = detectedProtocol.endsWith(":") ? detectedProtocol : detectedProtocol + ":";

    serverUrl = `${protocol}//${detectedHost}`;
  }

  return serverUrl;
};
