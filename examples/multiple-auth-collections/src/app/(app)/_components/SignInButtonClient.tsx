"use client";

import { SessionProvider, signIn } from "next-auth/react";

export function SignInButtonClient() {
  return (
    <SessionProvider basePath="/api/auth/customers">
      <button onClick={() => signIn()}>Sign In (Customer)</button>
    </SessionProvider>
  );
}
