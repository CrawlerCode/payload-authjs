import type { NextAuthConfig } from "next-auth";

// https://github.com/honeinc/is-iso-date/blob/8831e79b5b5ee615920dcb350a355ffc5cbf7aed/index.js#L5
const isoDateRE =
  // eslint-disable-next-line regexp/no-unused-capturing-group
  /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/;

export const isDate = (val: any): val is ConstructorParameters<typeof Date>[0] =>
  !!(val && isoDateRE.test(val) && !isNaN(Date.parse(val)));

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
