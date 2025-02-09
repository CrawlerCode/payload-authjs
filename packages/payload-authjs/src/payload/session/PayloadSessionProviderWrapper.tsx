import type { CollectionSlug } from "payload";
import { type ReactNode } from "react";
import { getPayloadSession } from "./getPayloadSession";
import { PayloadSessionProvider } from "./PayloadSessionProvider";

interface Props<TSlug extends CollectionSlug> {
  /**
   * The slug of the collection that contains the users
   *
   * @default "users"
   */
  userCollectionSlug?: TSlug;
  /**
   * The children to render
   */
  children: ReactNode;
}

/**
 * PayloadSessionProvider (server-side wrapper) that fetches the session and provides it to the context provider
 */
export const PayloadSessionProviderWrapper = async <TSlug extends CollectionSlug = "users">({
  userCollectionSlug,
  children,
}: Props<TSlug>) => {
  const session = await getPayloadSession({ userCollectionSlug });

  return (
    <PayloadSessionProvider userCollectionSlug={userCollectionSlug} session={session}>
      {children}
    </PayloadSessionProvider>
  );
};
