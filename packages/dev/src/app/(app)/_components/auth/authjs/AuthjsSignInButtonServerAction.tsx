import { signIn } from "@/auth";
import { Button } from "@/components/general/Button";
import { AuthjsLogo } from "@/components/img/AuthjsLogo";

/**
 * Sign in using Auth.js with a server action
 *
 * @see https://authjs.dev/getting-started/session-management/login?framework=Next.js
 */
export function AuthjsSignInButtonServerAction() {
  return (
    <form
      action={async () => {
        "use server";

        await signIn();
      }}
    >
      <Button type="submit">
        <AuthjsLogo />
        Sign In (server action)
      </Button>
    </form>
  );
}
