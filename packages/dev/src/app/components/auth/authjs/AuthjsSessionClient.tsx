"use client";

import { useSession } from "next-auth/react";
import Badge from "../../general/Badge";

export const AuthjsSessionClient = () => {
  const { status, data: session } = useSession();

  return (
    <>
      <div className="mb-2 flex flex-col items-start gap-2">
        <Badge
          variant={status === "authenticated" ? "green" : status === "loading" ? "yellow" : "red"}
        >
          status: {status}
        </Badge>
        {session?.expires && <Badge>Expires: {new Date(session.expires).toLocaleString()}</Badge>}
      </div>
      <pre className="overflow-auto rounded-lg bg-gray-100 p-4">
        {JSON.stringify(session?.user ?? null, null, 2)}
      </pre>
    </>
  );
};
