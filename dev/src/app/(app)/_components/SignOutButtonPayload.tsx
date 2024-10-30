"use client";

export function SignOutButtonPayload({
  userCollectionSlug = "users",
}: {
  userCollectionSlug?: string;
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
