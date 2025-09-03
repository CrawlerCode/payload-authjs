"use client";

import { Button } from "@/components/general/Button";
import { AuthjsLogo } from "@/components/img/AuthjsLogo";
import { signIn } from "next-auth/webauthn";

/**
 * Register a new passkey using Auth.js on the client
 *
 * @see https://authjs.dev/getting-started/authentication/webauthn
 */
export function AuthjsRegisterPasskeyButtonClient() {
  return (
    <Button onClick={() => signIn("passkey", { action: "register" })}>
      <AuthjsLogo />
      Register a Passkey (client)
    </Button>
  );
}
