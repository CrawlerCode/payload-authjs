import { signOut } from "@/auth.customers";

export function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut();
      }}
    >
      <button type="submit">Sign Out (Customer)</button>
    </form>
  );
}
