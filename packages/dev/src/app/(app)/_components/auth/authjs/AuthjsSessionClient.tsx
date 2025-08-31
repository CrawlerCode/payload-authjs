"use client";

import { useSession } from "next-auth/react";
import { SessionOverview } from "../SessionOverview";

/**
 * Get the Auth.js session using useSession hook on the client
 *
 * @see https://authjs.dev/getting-started/session-management/get-session?framework=Next.js%2520%28Client%29
 */
export const AuthjsSessionClient = () => {
  const { status, data: session } = useSession();

  return <SessionOverview status={status} user={session?.user} expires={session?.expires} />;
};
