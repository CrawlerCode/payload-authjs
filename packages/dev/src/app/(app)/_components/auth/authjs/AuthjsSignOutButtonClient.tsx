"use client";

import { Button } from "@/components/general/Button";
import { AuthjsLogo } from "@/components/img/AuthjsLogo";
import { signOut } from "next-auth/react";

/**
 * Sign out using Auth.js on the client
 *
 * @see https://authjs.dev/getting-started/session-management/login?framework=Next.js
 */
export function AuthjsSignOutButtonClient() {
  return (
    <Button onClick={() => signOut()}>
      <AuthjsLogo />
      Sign Out (client)
    </Button>
  );
}
