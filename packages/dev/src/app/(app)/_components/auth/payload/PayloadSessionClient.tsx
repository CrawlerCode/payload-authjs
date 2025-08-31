"use client";

import { usePayloadSession } from "payload-authjs/client";
import { SessionOverview } from "../SessionOverview";

/**
 * Get the payload session using usePayloadSession hook from payload-authjs on the client
 */
export const PayloadSessionClient = () => {
  const { status, session, refresh } = usePayloadSession();

  return (
    <SessionOverview
      status={status}
      user={session?.user}
      expires={session?.expires}
      collection={session?.collection}
      strategy={session?.strategy}
      onSessionRefresh={refresh}
    />
  );
};
