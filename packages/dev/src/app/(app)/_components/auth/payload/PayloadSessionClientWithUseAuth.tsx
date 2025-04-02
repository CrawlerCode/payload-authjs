"use client";

import type { User } from "@/payload-types";
import { useAuth } from "@payloadcms/ui";
import { StatusBadge } from "../StatusBadge";

export const PayloadSessionClientWithUseAuth = () => {
  const { user } = useAuth<User>();

  return (
    <>
      <div className="mb-2 flex gap-1">
        <StatusBadge status={user ? "authenticated" : "unauthenticated"} />
      </div>
      <pre className="overflow-auto rounded-lg bg-gray-100 p-4">
        {JSON.stringify(user ?? null, null, 2)}
      </pre>
    </>
  );
};
