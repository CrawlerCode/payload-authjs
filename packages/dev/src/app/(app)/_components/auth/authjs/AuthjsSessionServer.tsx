import { auth } from "@/auth";
import { SessionOverview } from "../SessionOverview";

/**
 * Get the Auth.js session using auth function on the server
 *
 * @see https://authjs.dev/getting-started/session-management/get-session?framework=Next.js
 */
export const AuthjsSessionServer = async () => {
  const session = await auth();

  return <SessionOverview user={session?.user} expires={session?.expires} />;
};
