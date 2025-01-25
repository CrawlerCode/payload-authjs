import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import type { Endpoint } from "payload";
import { withPayload } from "../../../authjs/withPayload";
import type { AuthjsPluginConfig } from "../../plugin";

/**
 * Override the default logout endpoint to destroy the authjs session
 *
 * @see https://payloadcms.com/docs/authentication/operations#logout
 * @see https://github.com/payloadcms/payload/blob/main/packages/payload/src/auth/endpoints/logout.ts
 */
export const logoutEndpoint: (pluginOptions: AuthjsPluginConfig) => Endpoint = pluginOptions => ({
  method: "post",
  path: "/logout",
  handler: async req => {
    // Sign out and get cookies from authjs
    const { signOut } = NextAuth(
      withPayload(pluginOptions.authjsConfig, {
        payload: req.payload,
        userCollectionSlug: pluginOptions.userCollectionSlug,
      }),
    );
    const { cookies } = await signOut({ redirect: false });

    // Create response with cookies
    const response = NextResponse.json({
      message: req.t("authentication:logoutSuccessful"),
    });
    for (const cookie of cookies) {
      response.cookies.set(cookie.name, cookie.value, cookie.options);
    }

    return response;
  },
});
