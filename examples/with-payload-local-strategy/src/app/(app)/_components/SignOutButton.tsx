"use client";

import type { CollectionSlug } from "payload";

export function SignOutButton({
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
        });
        window.location.reload();
      }}
    >
      Sign Out
    </button>
  );
}
