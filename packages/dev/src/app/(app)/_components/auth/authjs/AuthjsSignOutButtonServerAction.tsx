import { signOut } from "@/auth";
import { Button } from "@/components/general/Button";
import { AuthjsLogo } from "@/components/img/AuthjsLogo";

/**
 * Sign out using Auth.js with a server action
 *
 * @see https://authjs.dev/getting-started/session-management/login?framework=Next.js
 */
export function AuthjsSignOutButtonServerAction() {
  return (
    <form
      action={async () => {
        "use server";

        await signOut();
      }}
    >
      <Button type="submit">
        <AuthjsLogo />
        Sign Out (server action)
      </Button>
    </form>
  );
}
