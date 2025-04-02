import { auth } from "@/auth";
import { ExpiresBadge } from "../ExpiresBadge";
import { StatusBadge } from "../StatusBadge";

export const AuthjsSessionServer = async () => {
  const session = await auth();

  return (
    <>
      <div className="mb-2 flex gap-1">
        <StatusBadge status={session ? "authenticated" : "unauthenticated"} />
        <ExpiresBadge title="Session Expires" expiresAt={session?.expires} />
      </div>
      <pre className="overflow-auto rounded-lg bg-gray-100 p-4">
        {JSON.stringify(session?.user ?? null, null, 2)}
      </pre>
    </>
  );
};
