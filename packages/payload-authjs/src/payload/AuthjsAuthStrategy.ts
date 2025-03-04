import NextAuth from "next-auth";
import type { AuthStrategy, CollectionConfig, User as PayloadUser } from "payload";
import { withPayload } from "../authjs/withPayload";
import type { AuthjsPluginConfig } from "./plugin";
import { getAllVirtualFields } from "./utils/getAllVirtualFields";
import { getUserAttributes } from "./utils/getUserAttributes";

export const AUTHJS_STRATEGY_NAME = "Auth.js";

/**
 * Auth.js Authentication Strategy for Payload CMS
 * @see https://payloadcms.com/docs/authentication/custom-strategies
 */
export function AuthjsAuthStrategy(
  collection: CollectionConfig,
  pluginOptions: AuthjsPluginConfig,
): AuthStrategy {
  // Get all virtual fields
  const virtualFields = getAllVirtualFields(collection.fields);

  return {
    name: AUTHJS_STRATEGY_NAME,
    authenticate: async ({ payload }) => {
      // Get session from authjs
      const { auth } = NextAuth(
        withPayload(pluginOptions.authjsConfig, {
          payload,
          userCollectionSlug: collection.slug,
        }),
      );
      const session = await auth();

      // If no session, return null user
      if (!session?.user) {
        return { user: null };
      }

      // Find user in database
      const payloadUser = (
        await payload.find({
          collection: collection.slug,
          where: session.user.id
            ? // Find user by id if it exists
              { id: { equals: session.user.id } }
            : // Otherwise find user by email
              {
                email: {
                  equals: session.user.email,
                },
              },
        })
      ).docs.at(0);

      // If user does not exist in the database, log a warning and return null user
      if (!payloadUser) {
        payload.logger.warn(
          { name: "payload-authjs (AuthjsAuthStrategy)", session },
          `User '${session.user.id ?? session.user.email}' has a valid Auth.js session but does not exist in the payload database.`,
        );
        return { user: null };
      }

      // Get user virtual fields
      const virtualSessionFields = getUserAttributes(
        session.user,
        virtualFields,
      ) as Partial<PayloadUser>;

      // Return user to payload cms
      return {
        user: {
          _strategy: AUTHJS_STRATEGY_NAME,
          collection: collection.slug,
          ...payloadUser,
          ...virtualSessionFields,
        },
      };
    },
  };
}
