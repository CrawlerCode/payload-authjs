import type { NextAuthConfig } from "next-auth";
import type { CollectionSlug, CustomComponent, Plugin } from "payload";
import { getProviderMetadata } from "../authjs/utils/config";
import type { SignInButtonOptions, SignInButtonProps } from "../components/SignInButton";
import { generateUsersCollection } from "./collection";

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

  /**
   * Enable the default local strategy from Payload CMS (experimental)
   * @see https://payloadcms.com/docs/authentication/jwt
   *
   * @default false
   */
  enableLocalStrategy?: boolean;

  /**
   * Customize the components that the plugin adds to the admin panel
   */
  components?: {
    /**
     * Customize the SignInButton component
     * Or set to `false` to disable the SignInButton component
     */
    SignInButton?: SignInButtonOptions | false;
  };
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

    // Add the SignInButton component to the admin login page (only if the user collection is the admin user collection)
    if (
      incomingConfig.admin?.user === (pluginOptions.userCollectionSlug ?? "users") &&
      pluginOptions.components?.SignInButton !== false
    ) {
      const signInButtonOptions = pluginOptions.components?.SignInButton;
      config.admin = {
        ...config.admin,
        components: {
          ...config.admin?.components,
          providers: [
            ...(config.admin?.components?.providers ?? []),
            // Add the Auth.js SessionProvider to set the custom basePath
            ...(pluginOptions.authjsConfig.basePath
              ? [
                  {
                    path: "next-auth/react#SessionProvider",
                    clientProps: {
                      basePath: pluginOptions.authjsConfig.basePath,
                    },
                  },
                ]
              : []),
          ],
          afterLogin: [
            ...(config.admin?.components?.afterLogin ?? []),
            ...pluginOptions.authjsConfig.providers
              .map(provider => getProviderMetadata(provider))
              .filter(provider => ["oauth", "oidc"].includes(provider.type))
              .map(
                provider =>
                  ({
                    path: "payload-authjs/components#SignInButton",
                    clientProps: {
                      icon:
                        typeof signInButtonOptions?.icon === "function"
                          ? signInButtonOptions.icon(provider)
                          : signInButtonOptions?.icon,
                      text:
                        typeof signInButtonOptions?.text === "function"
                          ? signInButtonOptions.text(provider)
                          : signInButtonOptions?.text,
                      provider,
                    } satisfies SignInButtonProps,
                  }) satisfies CustomComponent,
              ),
          ],
        },
      };
    }

    return config;
  };
