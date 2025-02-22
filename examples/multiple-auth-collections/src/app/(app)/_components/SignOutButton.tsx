"use client";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch(`/api/customers/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
        window.location.reload();
      }}
    >
      Sign Out (Customer)
    </button>
  );
}
