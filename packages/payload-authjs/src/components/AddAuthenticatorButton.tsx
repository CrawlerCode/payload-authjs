"use client";

import { Button, useAuth, useDocumentInfo } from "@payloadcms/ui";
import { signIn } from "next-auth/webauthn";
import type { TypedUser } from "payload";
import type { getProviderMetadata } from "../authjs/utils/config";
import { AUTHJS_STRATEGY_NAME } from "../constants";

export type AddAuthenticatorButtonProps = {
  provider: ReturnType<typeof getProviderMetadata>;
};

/**
 * A button in the admin panel to add an authenticator using Auth.js
 *
 * @see https://authjs.dev/getting-started/authentication/webauthn
 */
export const AddAuthenticatorButton = ({ provider }: AddAuthenticatorButtonProps) => {
  const { collectionSlug, id } = useDocumentInfo();
  const { user } = useAuth<
    {
      collection?: string;
      _strategy?: string;
    } & TypedUser
  >();

  if (
    !user ||
    // Check if the current document belongs to the user
    user.collection !== collectionSlug ||
    user.id !== id ||
    // Register a new authenticator is only allowed if the user has a valid Auth.js session
    user._strategy !== AUTHJS_STRATEGY_NAME
  ) {
    return;
  }

  return (
    <div>
      <Button
        buttonStyle="secondary"
        onClick={async e => {
          e.preventDefault();
          await signIn(provider.id, { action: "register" });
        }}
      >
        Add Authenticator ({provider.name})
      </Button>
    </div>
  );
};
