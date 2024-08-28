import NextAuth from "next-auth";
import { AuthStrategy } from "payload";
import { AuthjsPluginConfig } from "./types";
import { withPayload } from "./withPayload";

/**
 * Auth.js Authentication Strategy for Payload CMS
 * @see https://payloadcms.com/docs/beta/authentication/custom-strategies
 */
export function AuthjsAuthStrategy(
  collectionSlug: string,
  pluginOptions: AuthjsPluginConfig,
): AuthStrategy {
  return {
    name: "authjs",
    authenticate: async ({ payload }) => {
      try {
        // Get session from authjs
        const { auth } = NextAuth(
          withPayload(pluginOptions.authjsConfig, {
            payload,
            userCollectionSlug: collectionSlug,
          }),
        );
        const session = await auth();

        // If no session, return null user
        if (!session?.user) return { user: null };

        // Find user in database
        let payloadUser = (
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
        if (!payloadUser) return { user: null };

        // Return user to payload cms
        return {
          user: {
            collection: collectionSlug,
            ...payloadUser,
          },
        };
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  };
}
