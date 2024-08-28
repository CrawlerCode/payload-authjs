import payloadConfig from "@payload-config";
import NextAuth from "next-auth";
import { withPayload } from "../../src";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth(
  withPayload(authConfig, {
    payloadConfig,
    updateUserOnSignIn: true,
  }),
);
