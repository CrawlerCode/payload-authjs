import { Button } from "@payloadcms/ui";
import NextAuth from "next-auth";
import type { ReactNode } from "react";

export type SignInWithAuthjsButtonProps = {
  authjsBasePath?: string;
  /**
   * Icon to display on the button
   *
   * @default <img src="https://authjs.dev/img/logo-sm.png" alt="Auth.js Logo" />
   */
  icon?: ReactNode;

  /**
   * Text to display on the button
   *
   * @default "Sign in with Auth.js"
   */
  text?: ReactNode;
};

/**
 * A button that redirects the user to the Auth.js sign in page
 */
export const SignInWithAuthjsButton: React.FC<SignInWithAuthjsButtonProps> = ({
  authjsBasePath,
  icon = <img src="https://authjs.dev/img/logo-sm.png" alt="Auth.js Logo" />,
  text = (
    <>
      Sign in with <strong>Auth.js</strong>
    </>
  ),
}) => {
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
      <Button type="submit" size="large" buttonStyle="secondary" icon={icon} iconPosition="left">
        {text}
      </Button>
    </form>
  );
};
