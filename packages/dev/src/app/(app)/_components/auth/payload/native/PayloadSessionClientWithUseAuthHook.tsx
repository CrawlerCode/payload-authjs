"use client";

import type { User } from "@/payload-types";
import { useAuth } from "@payloadcms/ui";
import { SessionOverview } from "../../SessionOverview";

/**
 * Get the Payload session using the useAuth hook on the client
 *
 * @see https://payloadcms.com/docs/admin/react-hooks#useauth
 */
export const PayloadSessionClientWithUseAuthHook = () => {
  const { user } = useAuth<
    {
      collection?: string;
      _strategy?: string;
    } & User
  >();

  return <SessionOverview user={user} collection={user?.collection} strategy={user?._strategy} />;
};
