import type { Plugin } from "payload";
import { generateUsersCollection } from "./generateUsersCollection";
import type { AuthjsPluginConfig } from "./types";

export const authjsPlugin =
  (pluginOptions: AuthjsPluginConfig): Plugin =>
  incomingConfig => {
    const config = { ...incomingConfig };

    // If the plugin is disabled, return the config as is
    if (pluginOptions.enabled === false) return config;

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
                    authjsBasePath: pluginOptions.authjsConfig.basePath ?? "/api/auth",
                    adminURL: config.routes?.admin ?? "/admin",
                  },
                },
              ]
            : []),
        ],
      },
    };

    return config;
  };
