"use client";

import { usePayloadSession } from "payload-authjs/client";
import Badge from "../../general/Badge";

export const PayloadSessionClientWithUsePayloadSession = () => {
  const { session, refresh } = usePayloadSession();

  return (
    <>
      <div className="mb-2 flex flex-col items-start gap-2">
        <Badge variant={session?.user ? "green" : "red"}>
          status: {session?.user ? "authenticated" : "unauthenticated"}
        </Badge>
        {session?.expires && (
          <Badge onClick={refresh}>Expires: {new Date(session.expires).toLocaleString()}</Badge>
        )}
      </div>
      <pre className="overflow-auto rounded-lg bg-gray-100 p-4">
        {JSON.stringify(session?.user ?? null, null, 2)}
      </pre>
    </>
  );
};
