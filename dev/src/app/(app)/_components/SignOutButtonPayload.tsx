"use client";

import type { CollectionSlug } from "payload";

export function SignOutButtonPayload({
  userCollectionSlug = "users",
}: {
  userCollectionSlug?: CollectionSlug;
}) {
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch(`/api/${userCollectionSlug}/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }).then(() => {
          window.location.reload();
        });
      }}
    >
      Sign Out (payload)
    </button>
  );
}
