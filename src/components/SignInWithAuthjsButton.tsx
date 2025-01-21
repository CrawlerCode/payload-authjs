import { Button } from "@payloadcms/ui";
import NextAuth from "next-auth";

/**
 * A button that redirects the user to the Auth.js sign in page
 */
export const SignInWithAuthjsButton = ({ authjsBasePath }: { authjsBasePath?: string }) => {
  return (
    <form
      style={{ display: "flex", justifyContent: "center" }}
      action={async () => {
        "use server";

        const { signIn } = NextAuth({
          basePath: authjsBasePath,
          providers: [],
        });

        await signIn();
      }}
    >
      <Button
        type="submit"
        size="large"
        buttonStyle="secondary"
        icon={<img src="https://authjs.dev/img/logo-sm.png" alt="Auth.js Logo" />}
        iconPosition="left"
      >
        Sign in with Auth.js
      </Button>
    </form>
  );
};
