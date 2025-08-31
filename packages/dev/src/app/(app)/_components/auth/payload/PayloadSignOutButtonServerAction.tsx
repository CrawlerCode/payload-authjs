import { Button } from "@/components/general/Button";
import { PayloadLogo } from "@/components/img/PayloadLogo";
import payloadConfig from "@payload-config";
import { logout } from "@payloadcms/next/auth";
import { redirect } from "next/navigation";

/**
 * Sign out using Auth.js with a server action
 *
 * @see https://payloadcms.com/docs/local-api/server-functions#logout
 */
export function PayloadSignOutButtonServerAction() {
  return (
    <form
      action={async () => {
        "use server";

        await logout({
          config: payloadConfig,
        });

        redirect("/");
      }}
    >
      <Button type="submit">
        <PayloadLogo variant="light" />
        Sign Out (server action)
      </Button>
    </form>
  );
}
