import github from "next-auth/providers/github";

export const githubProvider = github({
  allowDangerousEmailAccountLinking: true,
  /**
   * Add additional fields to the user on first sign in
   */
  async profile(profile, tokens) {
    return {
      // Default fields from github provider
      ...(await github({}).profile!(profile, tokens)),
      // Custom fields
      username: profile.login,
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
