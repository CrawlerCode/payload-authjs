import type { NextAuthConfig } from "next-auth";

/**
 * Check if an email provider is available in the authjs config
 */
export const isEmailProviderAvailable = (authjsConfig: NextAuthConfig) => {
  return authjsConfig.providers?.some(
    provider => (typeof provider === "function" ? provider().type : provider.type) === "email",
  );
};

/**
 * Check if the authjs session strategy is database
 */
export const isSessionStrategyDatabase = (authjsConfig: NextAuthConfig) => {
  return authjsConfig.session?.strategy === "database";
};
