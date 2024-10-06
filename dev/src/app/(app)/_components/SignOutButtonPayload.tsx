"use client";

export function SignOutButtonPayload({
  userCollectionSlug = "users",
}: {
  userCollectionSlug?: string;
}) {
  return (
    <button
      onClick={() => {
        fetch(`/api/${userCollectionSlug}/logout`, {
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
