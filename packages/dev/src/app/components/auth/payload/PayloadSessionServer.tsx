import { getPayloadSession } from "payload-authjs";
import Badge from "../../general/Badge";

export const PayloadSessionServer = async () => {
  const session = await getPayloadSession();

  return (
    <>
      <div className="mb-2 flex flex-col items-start gap-2">
        <Badge variant={session ? "green" : "red"}>
          status: {session ? "authenticated" : "unauthenticated"}
        </Badge>
        {session?.expires && <Badge>Expires: {new Date(session.expires).toLocaleString()}</Badge>}
      </div>
      <pre className="overflow-auto rounded-lg bg-gray-100 p-4">
        {JSON.stringify(session?.user ?? null, null, 2)}
      </pre>
    </>
  );
};
