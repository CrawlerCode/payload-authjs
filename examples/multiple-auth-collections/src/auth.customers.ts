import payloadConfig from "@payload-config";
import NextAuth from "next-auth";
import { withPayload } from "payload-authjs";
import { customersAuthConfig } from "./auth.customers.config";

export const { handlers, signIn, signOut, auth } = NextAuth(
  withPayload(customersAuthConfig, {
    userCollectionSlug: "customers",
    payloadConfig,
  }),
);
