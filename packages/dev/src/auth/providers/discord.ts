import discord from "next-auth/providers/discord";

export const discordProvider = discord({
  allowDangerousEmailAccountLinking: true,
  /**
   * Add additional fields to the user on first sign in
   */
  async profile(profile, tokens) {
    return {
      // Default fields from discord provider
      ...(await discord({}).profile!(profile, tokens)),
      // Custom fields
      additionalUserDatabaseField: `Create by discord provider profile callback at ${new Date().toISOString()}`,
    };
  },
  account(tokens) {
    return {
      ...tokens,
      additionalAccountDatabaseField: `Create by discord provider profile callback at ${new Date().toISOString()}`,
    };
  },
});
