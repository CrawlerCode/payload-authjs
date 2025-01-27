import { auth } from "@/auth";
import { getPayloadUser } from "payload-authjs";
import { SignInButtonAuthjs } from "./SignInButtonAuthjs";
import { SignOutButtonAuthjs } from "./SignOutButtonAuthjs";
import { SignOutButtonPayload } from "./SignOutButtonPayload";

const AuthOverview = async () => {
  const session = await auth();
  const payloadUser = await getPayloadUser();

  return (
    <div>
      <h3>Auth.js Session</h3>
      <p>{session?.user ? <SignOutButtonAuthjs /> : <SignInButtonAuthjs />}</p>
      <pre>{JSON.stringify(session ?? undefined, null, 2)}</pre>
      <br />
      <h3>Payload CMS User</h3>
      <p>{payloadUser && <SignOutButtonPayload />}</p>
      <pre>{JSON.stringify(payloadUser, null, 2)}</pre>
    </div>
  );
};

export default AuthOverview;
