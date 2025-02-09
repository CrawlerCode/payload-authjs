import { cookies, headers } from "next/headers";
import type { CollectionSlug, DataFromCollectionSlug } from "payload";

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
}

/**
 * Get the payload session from the server side
 */
export const getPayloadSession = async <TSlug extends CollectionSlug = "users">({
  userCollectionSlug = "users" as TSlug,
}: Options<TSlug> = {}): Promise<PayloadSession<TSlug> | null> => {
  // Get the server URL
  const serverUrl = await getServerUrl();

  // Fetch the session from the server
  const response = await fetch(`${serverUrl}/api/${userCollectionSlug}/me`, {
    headers: {
      Cookie: (await cookies()).toString(),
    },
  });
  const result: { user: DataFromCollectionSlug<TSlug>; exp: number } = await response.json();

  // If the response is not ok or the user is not present, return null
  if (!response.ok || !result.user) {
    return null;
  }

  // Return the session
  return {
    user: result.user,
    expires: new Date(result.exp * 1000).toISOString(),
  };
};

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
