import type { Endpoint, PayloadRequest } from "payload";
import { generatePayloadCookie, headersWithCors, refreshOperation } from "payload";

import { revalidateTag } from "next/cache";
import { getAuthjsInstance } from "../../../authjs/getAuthjsInstance";
import { AUTHJS_STRATEGY_NAME } from "../../../constants";
import type { AuthCollectionSlug } from "../../plugin";
import { getRequestCollection } from "../../utils/getRequestCollection";

/**
 * Override the default refresh endpoint to refresh the authjs session cookie
 *
 * @see https://payloadcms.com/docs/authentication/operations#refresh
 * @see https://github.com/payloadcms/payload/blob/main/packages/payload/src/auth/endpoints/refresh.ts
 * @see https://github.com/payloadcms/payload/blob/main/packages/payload/src/auth/operations/refresh.ts
 */
export const refreshEndpoint: Endpoint = {
  method: "post",
  path: "/refresh-token",
  handler: async req => {
    // --- Payload cms default logic ---
    const collection = getRequestCollection(req);
    const { t } = req;

    const headers = headersWithCors({
      headers: new Headers(),
      req,
    });

    const result = await refreshOperation({
      collection,
      req,
    });

    if (result.setCookie) {
      const cookie = generatePayloadCookie({
        collectionAuthConfig: collection.config.auth,
        cookiePrefix: req.payload.config.cookiePrefix,
        token: result.refreshedToken,
      });

      if (collection.config.auth.removeTokenFromResponses) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        delete result.refreshedToken;
      }

      headers.set("Set-Cookie", cookie);
    }

    const response = Response.json(
      {
        message: t("authentication:tokenRefreshSuccessful"),
        ...result,
      },
      {
        headers,
        status: 200,
      },
    );

    // --- Custom logic ---

    // If the user is authenticated using authjs, we need to refresh the authjs session cookie
    if (result.user?._strategy === AUTHJS_STRATEGY_NAME) {
      await refreshAuthjsSessionCookie(req, response, collection.config.slug as AuthCollectionSlug);

      // Revalidate the cache for the payload session
      revalidateTag("payload-session", "minutes");
    }

    return response;
  },
};

/**
 * Refresh the authjs session cookie
 */
const refreshAuthjsSessionCookie = async (
  req: PayloadRequest,
  response: Response,
  collectionSlug: AuthCollectionSlug,
) => {
  const { auth } = getAuthjsInstance(req.payload, collectionSlug);

  // Execute authjs "auth" function to refresh the session and generate cookies
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resp: Response = (await auth(req as any)) as any;

  // Set cookies on response
  for (const cookie of resp.headers.getSetCookie()) {
    response.headers.append("Set-Cookie", cookie);
  }
};
