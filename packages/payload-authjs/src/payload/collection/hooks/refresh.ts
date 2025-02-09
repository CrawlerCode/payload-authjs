import NextAuth from "next-auth";
import { type CollectionConfig, type CollectionRefreshHook, Forbidden } from "payload";
import { withPayload } from "../../../authjs/withPayload";
import type { AuthjsPluginConfig } from "../../plugin";
import { getAllVirtualFields } from "../../utils/getAllVirtualFields";
import { getUserAttributes } from "../../utils/getUserAttributes";

/**
 * Add refresh hook to override the refresh endpoint to refresh the session with authjs
 *
 * @see https://payloadcms.com/docs/hooks/collections#refresh
 * @see https://github.com/payloadcms/payload/blob/main/packages/payload/src/auth/operations/refresh.ts
 */
export const refreshHook: (
  collection: CollectionConfig,
  pluginOptions: AuthjsPluginConfig,
) => CollectionRefreshHook = (collection, pluginOptions) => {
  // Get all virtual fields
  const virtualFields = getAllVirtualFields(collection.fields);

  // Return the refresh hook
  return async ({ args: { req }, user }) => {
    // Get session from authjs
    const { auth } = NextAuth(
      withPayload(pluginOptions.authjsConfig, {
        payload: req.payload,
        userCollectionSlug: pluginOptions.userCollectionSlug,
      }),
    );
    const session = await auth();

    // If no session user, throw forbidden
    if (!session?.user) {
      throw new Forbidden(req.t);
    }

    // Get user virtual fields
    const virtualSessionFields = getUserAttributes(session.user, virtualFields);

    // Return user to payload cms
    return {
      exp: Math.floor(new Date(session.expires).getTime() / 1000),
      setCookie: undefined,
      refreshedToken: undefined as unknown as string,
      strategy: user._strategy,
      user: {
        ...user,
        ...virtualSessionFields,
      },
    };
  };
};
