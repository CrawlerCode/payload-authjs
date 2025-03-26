import github from "next-auth/providers/github";

export const githubProvider = github({
  allowDangerousEmailAccountLinking: true,
  /**
   * Add additional fields to the user on first sign in
   */
  profile(profile) {
    return {
      // Default fields (@see https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/github.ts#L176)
      id: profile.id.toString(),
      name: profile.name ?? profile.login,
      email: profile.email,
      image: profile.avatar_url,
      // Custom fields
      additionalUserDatabaseField: `Create by github provider profile callback at ${new Date().toISOString()}`,
    };
  },
  account(tokens) {
    return {
      ...tokens,
      additionalAccountDatabaseField: `Create by github provider profile callback at ${new Date().toISOString()}`,
    };
  },
});
