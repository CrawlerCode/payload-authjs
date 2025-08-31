"use client";

import { Button } from "@/components/general/Button";
import { AuthjsLogo } from "@/components/img/AuthjsLogo";
import { signIn } from "next-auth/react";

/**
 * Sign in using Auth.js on the client
 *
 * @see https://authjs.dev/getting-started/session-management/login?framework=Next.js
 */
export function AuthjsSignInButtonClient() {
  return (
    <Button onClick={() => signIn()}>
      <AuthjsLogo />
      Sign In (client)
    </Button>
  );
}
