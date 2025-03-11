"use client";

import type { User } from "@/payload-types";
import { useAuth } from "@payloadcms/ui";
import Badge from "../../general/Badge";

export const PayloadSessionClientWithUseAuth = () => {
  const { user } = useAuth<User>();

  return (
    <>
      <div className="mb-2 flex gap-1">
        <Badge variant={user ? "green" : "red"}>
          Status: {user ? "authenticated" : "unauthenticated"}
        </Badge>
      </div>
      <pre className="overflow-auto rounded-lg bg-gray-100 p-4">
        {JSON.stringify(user ?? null, null, 2)}
      </pre>
    </>
  );
};
