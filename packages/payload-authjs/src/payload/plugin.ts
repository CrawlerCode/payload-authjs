import type { NextAuthConfig } from "next-auth";
import NextAuth from "next-auth";
import type { CustomComponent, GeneratedTypes, Plugin } from "payload";
import { setAuthjsInstance } from "../authjs/getAuthjsInstance";
import { getProviderMetadata } from "../authjs/utils/config";
import { type EnrichedAuthConfig, withPayloadAuthjs } from "../authjs/withPayloadAuthjs";
import { generateUsersCollection } from "./collection";
import type { SignInButtonOptions, SignInButtonProps } from "./components/SignInButton";

export type AuthCollectionSlug<T = GeneratedTypes> = "auth" extends keyof T
  ? keyof T["auth"]
  : string;

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
  userCollectionSlug?: AuthCollectionSlug;

  /**
   * Auth.js configuration
   *
   * @example
   * import { config } from "./auth.config";
   *
   * authjsPlugin({ authjsConfig: config })
   */
  authjsConfig: EnrichedAuthConfig<NextAuthConfig>;

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

/**
 * The Auth.js plugin for Payload CMS
 */
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
    const collection = generateUsersCollection(config.collections, pluginOptions);

    // Add the SignInButton component to the admin login page (only if the user collection is the admin user collection)
    if (
      incomingConfig.admin?.user === collection.slug &&
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
              .filter(provider => ["oauth", "oidc", "webauthn"].includes(provider.type))
              .map(
                provider =>
                  ({
                    path:
                      provider.type === "webauthn"
                        ? "payload-authjs/components/webauthn#SignInButtonWebauthn"
                        : "payload-authjs/components#SignInButton",
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

    config.onInit = async payload => {
      payload.logger.debug(`Initializing Auth.js instance for collection '${collection.slug}'`);

      // Initialize Auth.js instance
      const authjs = NextAuth(
        withPayloadAuthjs({
          payload,
          config: pluginOptions.authjsConfig,
          collectionSlug: collection.slug as AuthCollectionSlug,
        }),
      );

      // Expose Auth.js instance to the payload instance
      setAuthjsInstance(payload, collection.slug as AuthCollectionSlug, authjs);

      // Execute the incoming onInit hook
      await incomingConfig.onInit?.(payload);
    };

    return config;
  };
