import type { NextAuthConfig } from "next-auth";

/**
 * ! This is a dummy config just to generate types !
 */
export const authConfig: NextAuthConfig = {
  session: {
    strategy: "database",
  },
  providers: [
    {
      type: "email",
    },
    {
      type: "webauthn",
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ] as any,
  experimental: {
    enableWebAuthn: true,
  },
};
