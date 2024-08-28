import { cookies } from "next/headers";
import { CollectionSlug, DataFromCollectionSlug } from "payload";

type Options<TSlug extends CollectionSlug> = {
  /**
   * The slug of the collection that contains the users
   *
   * @default "users"
   */
  userCollectionSlug?: TSlug;
};

export const getPayloadUser = async <TSlug extends CollectionSlug = "users">({
  userCollectionSlug = "users" as TSlug,
}: Options<TSlug> = {}) => {
  const cookieStore = cookies();

  const meUserReq = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/${userCollectionSlug}/me`,
    {
      headers: {
        Cookie: cookieStore.toString(),
      },
    },
  );

  const { user }: { user: DataFromCollectionSlug<TSlug> } = await meUserReq.json();

  if (!meUserReq.ok || !user) return;

  return user;
};
