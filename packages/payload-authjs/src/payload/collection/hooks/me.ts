import NextAuth from "next-auth";
import type { CollectionConfig, CollectionMeHook } from "payload";
import { withPayload } from "../../../authjs/withPayload";
import { getUserAttributes } from "../../../utils/authjs";
import { getAllVirtualFields } from "../../../utils/payload";
import type { AuthjsPluginConfig } from "../../plugin";

/**
 * Add me hook to override the me endpoint to include virtual fields
 *
 * @see https://payloadcms.com/docs/hooks/collections#me
 * @see https://github.com/payloadcms/payload/blob/main/packages/payload/src/auth/operations/me.ts
 */
export const meHook: (
  collection: CollectionConfig,
  pluginOptions: AuthjsPluginConfig,
) => CollectionMeHook | undefined = (collection, pluginOptions) => {
  // Get all virtual fields
  const virtualFields = getAllVirtualFields(collection.fields);

  // If no virtual fields exist, no need to override the me endpoint
  if (virtualFields.length === 0) {
    return undefined;
  }

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
      exp: new Date(session.expires).getTime(),
      user: {
        ...user,
        ...virtualSessionFields,
      },
    };
  };
};
