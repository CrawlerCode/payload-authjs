import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { APIError, type Endpoint, generateExpiredPayloadCookie, headersWithCors } from "payload";
import { withPayload } from "../../../authjs/withPayload";
import { AUTHJS_STRATEGY_NAME } from "../../AuthjsAuthStrategy";
import type { AuthjsPluginConfig } from "../../plugin";
import { getRequestCollection } from "../../utils/getRequestCollection";

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
    const { config: collection } = getRequestCollection(req);

    if (!req.user) {
      throw new APIError("No User", 400);
    }

    if (req.user.collection !== collection.slug) {
      throw new APIError("Incorrect collection", 403);
    }

    // Create response with cors headers
    const response = NextResponse.json(
      {
        message: req.t("authentication:logoutSuccessful"),
      },
      {
        headers: headersWithCors({
          headers: new Headers(),
          req,
        }),
      },
    );

    if (req.user._strategy === AUTHJS_STRATEGY_NAME) {
      // Generate expired cookies using authjs
      const { signOut } = NextAuth(
        withPayload(pluginOptions.authjsConfig, {
          payload: req.payload,
          userCollectionSlug: pluginOptions.userCollectionSlug,
        }),
      );
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
    } else {
      // Generate an expired cookie using payload cms
      const expiredCookie = generateExpiredPayloadCookie({
        collectionAuthConfig: collection.auth,
        config: req.payload.config,
        cookiePrefix: req.payload.config.cookiePrefix,
      });

      // Set cookie on response
      response.headers.set("Set-Cookie", expiredCookie);
    }

    // Execute afterLogout hooks
    if (collection.hooks?.afterLogout?.length) {
      for (const hook of collection.hooks.afterLogout) {
        await hook({
          collection,
          context: req.context,
          req,
        });
      }
    }

    return response;
  },
});
