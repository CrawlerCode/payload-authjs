import payloadConfig from "@payload-config";
import { headers } from "next/headers";
import { getPayload } from "payload";
import { SessionOverview } from "../../SessionOverview";

/**
 * Get the Payload session using the local API on the server
 *
 * @see https://payloadcms.com/docs/local-api/overview#auth
 */
export const PayloadSessionServerWithLocalApi = async () => {
  const payload = await getPayload({ config: payloadConfig });
  const { user } = await payload.auth({ headers: await headers() });

  return (
    <SessionOverview
      user={user}
      collection={user?.collection}
      strategy={
        user && "_strategy" in user && typeof user?._strategy === "string"
          ? user?._strategy
          : undefined
      }
    />
  );
};
