import NextAuth from "next-auth";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import type { CollectionAfterLogoutHook } from "payload";
import { withPayload } from "../../../authjs/withPayload";
import { AUTHJS_STRATEGY_NAME } from "../../AuthjsAuthStrategy";
import type { AuthjsPluginConfig } from "../../plugin";

/**
 * Add logout hook to destroy the authjs session
 *
 * @see https://payloadcms.com/docs/hooks/collections#afterlogout
 * @see https://github.com/payloadcms/payload/blob/main/packages/payload/src/auth/operations/logout.ts
 */
export const logoutHook: (
  pluginOptions: AuthjsPluginConfig,
) => CollectionAfterLogoutHook = pluginOptions => {
  // Return the logout hook
  return async ({ req }) => {
    // Check if user is authenticated using the authjs strategy
    if (req.user?._strategy !== AUTHJS_STRATEGY_NAME) {
      return;
    }

    // Create authjs instance
    const { signOut } = NextAuth(
      withPayload(pluginOptions.authjsConfig, {
        payload: req.payload,
        userCollectionSlug: pluginOptions.userCollectionSlug,
      }),
    );

    // Sign out and generate expired cookies using authjs
    const { cookies: authJsCookies } = (await signOut({ redirect: false })) as {
      cookies: {
        name: string;
        value: string;
        options: object;
      }[];
    };

    // Destroy the authjs session cookies
    const requestCookies = await cookies();
    for (const cookie of authJsCookies) {
      requestCookies.set(cookie.name, cookie.value, cookie.options);
    }

    // Revalidate the cache for the payload session
    revalidateTag("payload-session");
  };
};
