import { getPayloadSession } from "payload-authjs";
import { AuthjsSignInButtonClient } from "./authjs/AuthjsSignInButtonClient";
import { AuthjsSignInButtonServerAction } from "./authjs/AuthjsSignInButtonServerAction";
import { AuthjsSignOutButtonClient } from "./authjs/AuthjsSignOutButtonClient";
import { AuthjsSignOutButtonServerAction } from "./authjs/AuthjsSignOutButtonServerAction";
import { PayloadSignInButtonClient } from "./payload/PayloadSignInButtonClient";
import { PayloadSignOutButtonClient } from "./payload/PayloadSignOutButtonClient";
import { PayloadSignOutButtonServerAction } from "./payload/PayloadSignOutButtonServerAction";

export const SignInOrOutButtons = async () => {
  const session = await getPayloadSession();

  return (
    <section className="flex gap-2">
      {session ? (
        <>
          <PayloadSignOutButtonServerAction />
          <PayloadSignOutButtonClient />
          <AuthjsSignOutButtonServerAction />
          <AuthjsSignOutButtonClient />
        </>
      ) : (
        <>
          <AuthjsSignInButtonServerAction />
          <AuthjsSignInButtonClient />
          <PayloadSignInButtonClient />
        </>
      )}
    </section>
  );
};
