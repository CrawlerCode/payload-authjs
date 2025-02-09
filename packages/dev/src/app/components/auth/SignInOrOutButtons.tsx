import { getPayloadSession } from "payload-authjs";
import { SignInButtonAuthjs } from "./authjs/SignInButtonAuthjs";
import { SignOutButtonAuthjs } from "./authjs/SignOutButtonAuthjs";
import { SignOutButtonPayload } from "./payload/SignOutButtonPayload";

export const SignInOrOutButtons = async () => {
  const session = await getPayloadSession();

  return (
    <section>
      {session ? (
        <div className="flex">
          <SignOutButtonAuthjs />
          <SignOutButtonPayload />
        </div>
      ) : (
        <SignInButtonAuthjs />
      )}
    </section>
  );
};
