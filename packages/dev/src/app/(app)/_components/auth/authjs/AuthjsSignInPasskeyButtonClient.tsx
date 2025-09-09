"use client";

import { Button } from "@/components/general/Button";
import { AuthjsLogo } from "@/components/img/AuthjsLogo";
import { signIn } from "next-auth/webauthn";

/**
 * Sign in with a passkey using Auth.js on the client
 *
 * @see https://authjs.dev/getting-started/authentication/webauthn
 */
export function AuthjsSignInPasskeyButtonClient() {
  return (
    <Button onClick={() => signIn("passkey")}>
      <AuthjsLogo />
      Sign In with Passkey (client)
    </Button>
  );
}
