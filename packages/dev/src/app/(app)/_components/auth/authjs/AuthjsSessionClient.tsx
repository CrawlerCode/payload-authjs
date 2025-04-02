"use client";

import { useSession } from "next-auth/react";
import { ExpiresBadge } from "../ExpiresBadge";
import { StatusBadge } from "../StatusBadge";

export const AuthjsSessionClient = () => {
  const { status, data: session } = useSession();

  return (
    <>
      <div className="mb-2 flex gap-1">
        <StatusBadge status={status} />
        <ExpiresBadge title="Session Expires" expiresAt={session?.expires} />
      </div>
      <pre className="overflow-auto rounded-lg bg-gray-100 p-4">
        {JSON.stringify(session?.user ?? null, null, 2)}
      </pre>
    </>
  );
};
