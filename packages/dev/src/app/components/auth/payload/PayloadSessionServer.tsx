import { revalidateTag } from "next/cache";
import { getPayloadSession } from "payload-authjs";
import Badge from "../../general/Badge";

export const PayloadSessionServer = async () => {
  const session = await getPayloadSession();

  return (
    <>
      <div className="mb-2 flex gap-1">
        <Badge variant={session ? "green" : "red"}>
          Status: {session ? "authenticated" : "unauthenticated"}
        </Badge>
        {session?.expires && (
          <Badge
            variant="yellow"
            onClick={async () => {
              "use server";

              revalidateTag("payload-session");

              return Promise.resolve();
            }}
          >
            Expires: {new Date(session.expires).toLocaleString()}
          </Badge>
        )}
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
