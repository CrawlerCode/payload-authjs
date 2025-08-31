"use client";

import { Button } from "@/components/general/Button";
import { PayloadLogo } from "@/components/img/PayloadLogo";
import type { CollectionSlug } from "payload";

/**
 * Sign out using Payload on the client
 *
 * @see https://payloadcms.com/docs/rest-api/overview#auth-operations
 */
export function PayloadSignOutButtonClient({
  userCollectionSlug = "users",
}: {
  userCollectionSlug?: CollectionSlug;
}) {
  return (
    <Button
      onClick={async () => {
        await fetch(`/api/${userCollectionSlug}/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
        window.location.reload();
      }}
    >
      <PayloadLogo variant="light" />
      Sign Out (client)
    </Button>
  );
}
