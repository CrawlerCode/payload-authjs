"use client";

import { useAuth } from "@payloadcms/ui";
import { type User } from "payload/generated-types";
import Badge from "../../general/Badge";

export const PayloadSessionClientWithUseAuth = () => {
  const { user } = useAuth<User>();

  return (
    <>
      <div className="mb-2 flex flex-col items-start gap-2">
        <Badge variant={user ? "green" : "red"}>
          status: {user ? "authenticated" : "unauthenticated"}
        </Badge>
      </div>
      <pre className="overflow-auto rounded-lg bg-gray-100 p-4">
        {JSON.stringify(user ?? null, null, 2)}
      </pre>
    </>
  );
};
