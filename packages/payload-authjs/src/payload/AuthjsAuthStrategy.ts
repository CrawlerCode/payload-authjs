import type { AuthStrategy, CollectionConfig } from "payload";
import { getAuthjsInstance } from "../authjs/getAuthjsInstance";
import { AUTHJS_STRATEGY_NAME } from "../constants";
import type { AuthCollectionSlug } from "./plugin";
import { getAllVirtualFields } from "./utils/getAllVirtualFields";
import { getUserAttributes } from "./utils/getUserAttributes";

/**
 * Auth.js Authentication Strategy for Payload CMS
 * @see https://payloadcms.com/docs/authentication/custom-strategies
 */
export function AuthjsAuthStrategy(collection: CollectionConfig): AuthStrategy {
  // Get all virtual fields
  const virtualFields = getAllVirtualFields(collection.fields);

  return {
    name: AUTHJS_STRATEGY_NAME,
    authenticate: async ({ payload, isGraphQL }) => {
      // Get session from authjs
      const { auth } = getAuthjsInstance(payload, collection.slug as AuthCollectionSlug);
      const session = await auth();

      // If no session, return null user
      if (!session?.user) {
        return { user: null };
      }

      // Find user in database
      const sanitizedCollectionConfig =
        payload.collections[collection.slug as AuthCollectionSlug].config;
      const payloadUser = (
        await payload.find({
          collection: collection.slug as AuthCollectionSlug,
          where: session.user.id
            ? // Find user by id if it exists
              { id: { equals: session.user.id } }
            : // Otherwise find user by email
              {
                email: {
                  equals: session.user.email,
                },
              },
          depth: isGraphQL ? 0 : sanitizedCollectionConfig.auth.depth,
          limit: 1,
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
      const virtualSessionFields = getUserAttributes<AuthCollectionSlug>(
        session.user,
        virtualFields,
      );

      // Return user to payload cms
      return {
        user: {
          _strategy: AUTHJS_STRATEGY_NAME,
          collection: collection.slug as AuthCollectionSlug,
          ...payloadUser,
          ...virtualSessionFields,
        },
      };
    },
  };
}
