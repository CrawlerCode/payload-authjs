import { createActionURL } from "@auth/core";
import { Button } from "@payloadcms/ui";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";

/**
 * A button that redirects the user to the Auth.js sign in page
 */
export const SignInWithAuthjsButton = ({
  authjsBasePath,
  adminURL,
}: {
  authjsBasePath: string;
  adminURL: string;
}) => {
  return (
    <form
      style={{ display: "flex", justifyContent: "center" }}
      action={async () => {
        "use server";

        const signInURL = createActionURL(
          "signin",
          "https",
          headers(),
          process.env,
          authjsBasePath,
        );
        signInURL.searchParams.append("callbackUrl", adminURL);

        redirect(signInURL.toString());
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
