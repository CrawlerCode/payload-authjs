import payloadConfig from "@payload-config";
import NextAuth from "next-auth";
import { withPayload } from "payload-authjs";
import { adminsAuthConfig } from "./auth.admins.config";

export const { handlers, signIn, signOut, auth } = NextAuth(
  withPayload(adminsAuthConfig, {
    userCollectionSlug: "admins",
    payloadConfig,
  }),
);
