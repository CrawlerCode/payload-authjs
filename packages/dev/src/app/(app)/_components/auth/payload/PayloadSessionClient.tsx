"use client";

import Badge from "@/components/general/Badge";
import { usePayloadSession } from "payload-authjs/client";
import { ExpiresBadge } from "../ExpiresBadge";
import { StatusBadge } from "../StatusBadge";

export const PayloadSessionClient = () => {
  const { status, session, refresh } = usePayloadSession();

  return (
    <>
      <div className="mb-2 flex gap-1">
        <StatusBadge status={status} />
        <ExpiresBadge title="Session Expires" expiresAt={session?.expires} onClick={refresh} />
        <ExpiresBadge title="Account Expires" expiresAt={session?.user.currentAccount?.expiresAt} />
        <ExpiresBadge
          title="Account Refresh Token Expires"
          expiresAt={session?.user.currentAccount?.refreshExpiresAt}
        />
        {session?.collection ? (
          <Badge variant="dark">Collection: {session.collection}</Badge>
        ) : null}
        {session?.strategy ? <Badge variant="dark">Strategy: {session.strategy}</Badge> : null}
      </div>
      <pre className="overflow-auto rounded-lg bg-gray-100 p-4">
        {JSON.stringify(session?.user ?? null, null, 2)}
      </pre>
    </>
  );
};
