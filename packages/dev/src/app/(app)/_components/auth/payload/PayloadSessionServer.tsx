import { revalidateTag } from "next/cache";
import { getPayloadSession } from "payload-authjs";
import { SessionOverview } from "../SessionOverview";

/**
 * Get the payload session using getPayloadSession from payload-authjs on the server
 */
export const PayloadSessionServer = async () => {
  const session = await getPayloadSession();

  const refreshSession = async () => {
    "use server";

    revalidateTag("payload-session", "minutes");

    return Promise.resolve();
  };

  return (
    <SessionOverview
      user={session?.user}
      expires={session?.expires}
      collection={session?.collection}
      strategy={session?.strategy}
      onSessionRefresh={refreshSession}
    />
  );
};
