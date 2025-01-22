import type { NextAuthConfig } from "next-auth";
import type { CollectionSlug, Plugin } from "payload";
import { generateUsersCollection } from "./generateUsersCollection";

export interface AuthjsPluginConfig {
  /**
   * Enable or disable plugin
   *
   * @default true
   */
  enabled?: boolean;

  /**
   * The slug of the collection that contains the users
   *
   * @default "users"
   */
  userCollectionSlug?: CollectionSlug;

  /**
   * Auth.js configuration
   *
   * @example
   * import { config } from "./auth.config";
   *
   * authjsPlugin({ authjsConfig: config })
   */
  authjsConfig: NextAuthConfig;
}

export const authjsPlugin =
  (pluginOptions: AuthjsPluginConfig): Plugin =>
  incomingConfig => {
    const config = { ...incomingConfig };

    // If the plugin is disabled, return the config as is
    if (pluginOptions.enabled === false) {
      return config;
    }

    // Generate users collection
    config.collections = config.collections ?? [];
    generateUsersCollection(config.collections, pluginOptions);

    // Add custom components to admin
    config.admin = {
      ...config.admin,
      components: {
        ...config.admin?.components,
        afterLogin: [
          ...(config.admin?.components?.afterLogin ?? []),
          // Add the SignInWithAuthjsButton component to the admin login page (only if the user collection is the admin user collection)
          ...(incomingConfig.admin?.user === (pluginOptions.userCollectionSlug ?? "users")
            ? [
                {
                  path: "payload-authjs/components#SignInWithAuthjsButton",
                  serverProps: {
                    authjsBasePath: pluginOptions.authjsConfig.basePath,
                  },
                },
              ]
            : []),
        ],
      },
    };

    return config;
  };
