import { cookies } from "next/headers";
import type { CollectionSlug, DataFromCollectionSlug } from "payload";

interface Options<TSlug extends CollectionSlug> {
  /**
   * The URL of the server
   *
   * @default process.env.NEXT_PUBLIC_SERVER_URL
   */
  serverUrl?: string;
  /**
   * The slug of the collection that contains the users
   *
   * @default "users"
   */
  userCollectionSlug?: TSlug;
}

/**
 * Get the payload user from the server (only works on the server side)
 *
 * @deprecated Use `getPayloadSession` instead
 */
export const getPayloadUser = async <TSlug extends CollectionSlug = "users">({
  serverUrl = process.env.NEXT_PUBLIC_SERVER_URL,
  userCollectionSlug = "users" as TSlug,
}: Options<TSlug> = {}): Promise<DataFromCollectionSlug<TSlug> | undefined> => {
  const requestCookies = await cookies();

  if (serverUrl === undefined) {
    throw new Error(
      "getPayloadUser requires a server URL to be provided, either as an option or as the 'NEXT_PUBLIC_SERVER_URL' environment variable",
    );
  }

  const meUserReq = await fetch(`${serverUrl}/api/${userCollectionSlug}/me`, {
    headers: {
      Cookie: requestCookies.toString(),
    },
  });

  const { user }: { user: DataFromCollectionSlug<TSlug> } = await meUserReq.json();

  if (!meUserReq.ok || !user) {
    return undefined;
  }

  return user;
};
