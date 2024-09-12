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
  // eslint-disable-next-line no-process-env
  serverUrl = process.env.NEXT_PUBLIC_SERVER_URL,
  userCollectionSlug = "users",
}: Options = {}): Promise<T | null> => {
  if (serverUrl === undefined) {
    throw new Error(
      "getPayloadUser requires a server URL to be provided, either as an option or in the 'NEXT_PUBLIC_SERVER_URL' environment variable",
    );
  }

  const cookieStore = cookies();

  const meUserReq = await fetch(`${serverUrl}/api/${userCollectionSlug}/me`, {
    headers: {
      Cookie: cookieStore.toString(),
    },
  });

  const { user }: { user: T } = await meUserReq.json();

  if (!meUserReq.ok || !user) return null;

  return user;
};
