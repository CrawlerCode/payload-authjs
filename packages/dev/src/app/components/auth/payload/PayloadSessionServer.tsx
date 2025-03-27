import { revalidateTag } from "next/cache";
import { getPayloadSession } from "payload-authjs";
import Badge from "../../general/Badge";
import { ExpiresBadge } from "../ExpiresBadge";

export const PayloadSessionServer = async () => {
  const session = await getPayloadSession();

  return (
    <>
      <div className="mb-2 flex gap-1">
        <Badge variant={session ? "green" : "red"}>
          Status: {session ? "authenticated" : "unauthenticated"}
        </Badge>
        <ExpiresBadge
          title="Session Expires"
          expiresAt={session?.expires}
          onClick={async () => {
            "use server";

            revalidateTag("payload-session");

            return Promise.resolve();
          }}
        />
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
