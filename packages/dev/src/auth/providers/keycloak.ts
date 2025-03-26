import keycloak from "next-auth/providers/keycloak";

export const keycloakProvider = keycloak({
  allowDangerousEmailAccountLinking: true,
  /**
   * Add additional fields to the user on first sign in
   */
  profile(profile) {
    return {
      // Default fields
      id: profile.sub,
      name: profile.name,
      email: profile.email,
      image: profile.picture,
      // Custom fields
      locale: profile.locale,
      additionalUserDatabaseField: `Create by keycloak provider profile callback at ${new Date().toISOString()}`,
    };
  },
  account(tokens) {
    return {
      ...tokens,
      additionalAccountDatabaseField: `Create by keycloak provider profile callback at ${new Date().toISOString()}`,
    };
  },
});
