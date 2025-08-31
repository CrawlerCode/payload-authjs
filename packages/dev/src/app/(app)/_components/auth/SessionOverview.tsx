import Badge from "@/components/general/Badge";
import type { User as PayloadUser } from "@/payload-types";
import type { User as AuthJsUser } from "next-auth";
import type { ComponentProps } from "react";
import { ExpiresBadge } from "./ExpiresBadge";
import { StatusBadge } from "./StatusBadge";

export const SessionOverview = ({
  status,
  user,
  expires,
  collection,
  strategy,
  onSessionRefresh,
}: {
  status?: ComponentProps<typeof StatusBadge>["status"];
  user?: null | PayloadUser | AuthJsUser;
  expires?: string;
  collection?: string;
  strategy?: string;
  onSessionRefresh?: () => unknown;
}) => {
  return (
    <>
      <div className="mb-2 flex gap-1">
        <StatusBadge status={status ?? (user ? "authenticated" : "unauthenticated")} />
        {expires && (
          <ExpiresBadge title="Session Expires" expiresAt={expires} onClick={onSessionRefresh} />
        )}
        <ExpiresBadge title="Account Expires" expiresAt={user?.currentAccount?.expiresAt} />
        <ExpiresBadge
          title="Account Refresh Token Expires"
          expiresAt={user?.currentAccount?.refreshExpiresAt}
        />
        {collection ? <Badge variant="dark">Collection: {collection}</Badge> : null}
        {strategy ? <Badge variant="dark">Strategy: {strategy}</Badge> : null}
      </div>
      <pre className="overflow-auto rounded-lg bg-gray-100 p-4">
        {JSON.stringify(user ?? null, null, 2)}
      </pre>
    </>
  );
};
