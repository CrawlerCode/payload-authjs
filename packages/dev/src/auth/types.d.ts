/* eslint-disable @typescript-eslint/no-empty-object-type */
import type { User as PayloadUser } from "@/payload-types";
import "next-auth/jwt";
import type { PayloadAuthjsUser } from "payload-authjs";

declare module "next-auth" {
  interface User extends PayloadAuthjsUser<PayloadUser> {}
}
declare module "next-auth/jwt" {
  interface JWT
    extends Partial<
      Pick<PayloadUser, "id" | "additionalUserVirtualField" | "roles" | "currentAccount">
    > {}
}
