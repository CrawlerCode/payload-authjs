import NextAuth from "next-auth";
import type { CollectionConfig, CollectionMeHook } from "payload";
import { withPayload } from "../../../authjs/withPayload";
import type { AuthjsPluginConfig } from "../../plugin";
import { getAllVirtualFields } from "../../utils/getAllVirtualFields";
import { getUserAttributes } from "../../utils/getUserAttributes";

/**
 * Add me hook to override the me endpoint to include 'exp' and virtual fields
 *
 * @see https://payloadcms.com/docs/hooks/collections#me
 * @see https://github.com/payloadcms/payload/blob/main/packages/payload/src/auth/operations/me.ts
 */
export const meHook: (
  collection: CollectionConfig,
  pluginOptions: AuthjsPluginConfig,
) => CollectionMeHook = (collection, pluginOptions) => {
  // Get all virtual fields
  const virtualFields = getAllVirtualFields(collection.fields);

  // Return the me hook
  return async ({ args: { req }, user }) => {
    // Get session from authjs
    const { auth } = NextAuth(
      withPayload(pluginOptions.authjsConfig, {
        payload: req.payload,
        userCollectionSlug: pluginOptions.userCollectionSlug,
      }),
    );
    const session = await auth();

    // If no session, return
    if (!session?.user) {
      return undefined;
    }

    // Get user virtual fields
    const virtualSessionFields = getUserAttributes(session.user, virtualFields);

    // Return user to payload cms
    return {
      exp: Math.floor(new Date(session.expires).getTime() / 1000),
      user: {
        ...user,
        ...virtualSessionFields,
      },
    };
  };
};
