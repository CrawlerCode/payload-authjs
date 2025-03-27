import NextAuth from "next-auth";
import type { Endpoint, PayloadRequest } from "payload";
import { generateExpiredPayloadCookie, headersWithCors, logoutOperation } from "payload";

import { NextResponse } from "next/server";
import { withPayload } from "../../../authjs/withPayload";
import { AUTHJS_STRATEGY_NAME } from "../../AuthjsAuthStrategy";
import type { AuthjsPluginConfig } from "../../plugin";
import { getRequestCollection } from "../../utils/getRequestCollection";
import { revalidateTag } from "next/cache";

/**
 * Override the default logout endpoint to destroy the authjs session
 *
 * @see https://payloadcms.com/docs/authentication/operations#logout
 * @see https://github.com/payloadcms/payload/blob/main/packages/payload/src/auth/endpoints/logout.ts
 * @see https://github.com/payloadcms/payload/blob/main/packages/payload/src/auth/operations/logout.ts
 */
export const logoutEndpoint: (pluginOptions: AuthjsPluginConfig) => Endpoint = pluginOptions => ({
  method: "post",
  path: "/logout",
  handler: async req => {
    // --- Payload cms default logic ---
    const collection = getRequestCollection(req);
    const { t } = req;
    const result = await logoutOperation({
      collection,
      req,
    });

    const headers = headersWithCors({
      headers: new Headers(),
      req,
    });

    if (!result) {
      return Response.json(
        {
          message: t("error:logoutFailed"),
        },
        {
          headers,
          status: 500,
        },
      );
    }

    const expiredCookie = generateExpiredPayloadCookie({
      collectionAuthConfig: collection.config.auth,
      config: req.payload.config,
      cookiePrefix: req.payload.config.cookiePrefix,
    });

    headers.set("Set-Cookie", expiredCookie);

    const response = NextResponse.json(
      {
        message: t("authentication:logoutSuccessful"),
      },
      {
        headers,
        status: 200,
      },
    );

    // --- Custom logic ---

    // If the user is authenticated using authjs, we need to destroy the authjs session cookie
    if (req.user?._strategy === AUTHJS_STRATEGY_NAME) {
      await destroyAuthjsSessionCookie(req, response, pluginOptions);

      // Revalidate the cache for the payload session
      revalidateTag("payload-session");
    }

    return response;
  },
});

/**
 * Destroy the authjs session cookie
 */
const destroyAuthjsSessionCookie = async (
  req: PayloadRequest,
  response: NextResponse,
  pluginOptions: AuthjsPluginConfig,
) => {
  // Create authjs instance
  const { signOut } = NextAuth(
    withPayload(pluginOptions.authjsConfig, {
      payload: req.payload,
      userCollectionSlug: pluginOptions.userCollectionSlug,
    }),
  );

  // Generate expired cookies using authjs
  const { cookies } = (await signOut({ redirect: false })) as {
    cookies: {
      name: string;
      value: string;
      options: object;
    }[];
  };

  // Set cookies on response
  for (const cookie of cookies) {
    response.cookies.set(cookie.name, cookie.value, cookie.options);
  }
};
