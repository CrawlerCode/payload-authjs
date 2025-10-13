"use client";

import { Button } from "@payloadcms/ui";
import { signIn } from "next-auth/react";
import type { ReactNode } from "react";
import type { getProviderMetadata } from "../../../authjs/utils/config";
import "./index.css";

export type SignInButtonOptions = {
  /**
   * Icon to display on the button
   *
   * @default
   * ```tsx
   * <img src={provider.iconUrl} alt={`Provider ${provider.name}`} />
   * ```
   */
  icon?: ReactNode | ((provider: ReturnType<typeof getProviderMetadata>) => ReactNode);
  /**
   * Text to display on the button
   *
   * @default
   * ```tsx
   * <>Sign in with <strong>{provider.name}</strong></>
   * ```
   */
  text?: ReactNode | ((provider: ReturnType<typeof getProviderMetadata>) => ReactNode);
};

export type SignInButtonProps = {
  provider: ReturnType<typeof getProviderMetadata>;
  icon?: ReactNode;
  text?: ReactNode;
  signInFn?: typeof signIn;
};

/**
 * A button on the sign in page to sign in with a Auth.js provider
 */
export const SignInButton = ({
  provider,
  icon = <img src={provider.icon} alt={`Provider ${provider.name}`} />,
  text = (
    <>
      Sign in with <strong>{provider.name}</strong>
    </>
  ),
  signInFn = signIn,
}: SignInButtonProps) => {
  return (
    <Button
      className="payload-authjs-sign-in-button"
      size="large"
      buttonStyle="pill"
      icon={icon}
      iconPosition="left"
      onClick={async () => {
        await signInFn(provider.id);
      }}
    >
      {text}
    </Button>
  );
};
