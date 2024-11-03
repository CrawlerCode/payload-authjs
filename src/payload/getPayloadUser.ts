import { cookies } from "next/headers";
import type { CollectionSlug } from "payload";
import type { User } from "./types";

interface Options {
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
  userCollectionSlug?: CollectionSlug;
}

/**
 * Get the user payload from the server (only works on the server side)
 */
export const getPayloadUser = async <T extends object = User>({
  serverUrl = process.env.NEXT_PUBLIC_SERVER_URL,
  userCollectionSlug = "users",
}: Options = {}): Promise<T | null> => {
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

  const { user }: { user: T } = await meUserReq.json();

  if (!meUserReq.ok || !user) {
    return null;
  }

  return user;
};
