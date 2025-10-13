import type { Field } from "payload";
import { getProviderMetadata } from "../../../authjs/utils/config";
import type { AddAuthenticatorButtonProps } from "../../components/AddAuthenticatorButton";
import type { AuthjsPluginConfig } from "../../plugin";

/**
 * Authenticators field for a user
 *
 * @see https://authjs.dev/reference/core/adapters#adapterauthenticator
 * @see https://authjs.dev/reference/core/types#authenticator
 */
export const authenticatorsField = (pluginOptions: AuthjsPluginConfig): Field => {
  const providers = pluginOptions.authjsConfig.providers
    .map(provider => getProviderMetadata(provider))
    .filter(provider => provider.type === "webauthn");

  return {
    name: "authenticators",
    type: "array",
    fields: [
      { name: "credentialID", type: "text", required: true, index: true },
      { name: "credentialPublicKey", type: "text", required: true },
      { name: "credentialBackedUp", type: "checkbox", required: true },
      { name: "counter", type: "number", required: true },
      { name: "transports", type: "text" },
      { name: "credentialDeviceType", type: "text", required: true },
    ],
    admin: {
      initCollapsed: true,
      components: {
        afterInput: providers.map(provider => ({
          path: "payload-authjs/components/webauthn#AddAuthenticatorButton",
          clientProps: {
            provider,
          } satisfies AddAuthenticatorButtonProps,
        })),
      },
    },
    access: {
      create: () => false,
      update: () => false,
    },
  };
};
