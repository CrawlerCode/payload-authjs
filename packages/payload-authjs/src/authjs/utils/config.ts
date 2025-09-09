import type { NextAuthConfig } from "next-auth";
import type { Provider } from "next-auth/providers";

/**
 * Get provider metadata
 */
export const getProviderMetadata = (provider: Provider) => {
  const providerOptions = typeof provider === "function" ? provider() : provider;

  return {
    type: providerOptions.type,
    id: (providerOptions.options?.id as string | undefined) ?? providerOptions.id,
    name: (providerOptions.options?.name as string | undefined) ?? providerOptions.name,
    icon: `https://authjs.dev/img/providers/${providerOptions.id}.svg`,
  };
};

/**
 * Check if an email provider is available in the authjs config
 */
export const isEmailProviderAvailable = (authjsConfig: NextAuthConfig) => {
  return authjsConfig.providers?.some(
    provider => (typeof provider === "function" ? provider().type : provider.type) === "email",
  );
};

/**
 * Check if a webauthn provider is available in the authjs config
 */
export const isWebauthnProviderAvailable = (authjsConfig: NextAuthConfig) => {
  return authjsConfig.providers?.some(
    provider => (typeof provider === "function" ? provider().type : provider.type) === "webauthn",
  );
};

/**
 * Check if the authjs session strategy is database
 */
export const isSessionStrategyDatabase = (authjsConfig: NextAuthConfig) => {
  return authjsConfig.session?.strategy === "database";
};
