import payloadConfig from "@payload-config";
import NextAuth from "next-auth";
import nodemailer from "next-auth/providers/nodemailer";
import { withPayload } from "../../src";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth(
  withPayload(
    {
      ...authConfig,
      providers: [
        ...authConfig.providers,
        /**
         * Add nodemailer provider
         * ! Exclude this provider in the auth.config.ts file to be edge compatible
         * @see https://authjs.dev/guides/edge-compatibility
         */
        nodemailer({
          server: process.env.EMAIL_SERVER,
          from: process.env.EMAIL_FROM,
        }),
      ],
    },
    {
      payloadConfig,
      updateUserOnSignIn: true,
    },
  ),
);
