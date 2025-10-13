"use client";

import { signIn } from "next-auth/webauthn";
import type { SignInButtonProps } from "./SignInButton";
import { SignInButton } from "./SignInButton";

/**
 * Wrapper around the SignInButton component to use the webauthn signIn function
 */
export const SignInButtonWebauthn = (props: SignInButtonProps) => (
  <SignInButton {...props} signInFn={signIn} />
);
