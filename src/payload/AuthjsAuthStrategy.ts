import NextAuth from "next-auth";
import type { AuthStrategy } from "payload";
import { withPayload } from "../authjs/withPayload";
import type { AuthjsPluginConfig } from "./plugin";

/**
 * Auth.js Authentication Strategy for Payload CMS
 * @see https://payloadcms.com/docs/authentication/custom-strategies
 */
export function AuthjsAuthStrategy(
  collectionSlug: string,
  pluginOptions: AuthjsPluginConfig,
): AuthStrategy {
  return {
    name: "authjs",
    authenticate: async ({ payload }) => {
      // Get session from authjs
      const { auth } = NextAuth(
        withPayload(pluginOptions.authjsConfig, {
          payload,
          userCollectionSlug: collectionSlug,
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
          collection: collectionSlug,
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
      if (!payloadUser) {
        return { user: null };
      }

      // Return user to payload cms
      return {
        user: {
          collection: collectionSlug,
          ...payloadUser,
        },
      };
    },
  };
}
