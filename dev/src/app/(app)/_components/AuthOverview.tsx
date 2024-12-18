import { auth } from "@/auth";
import { getPayloadUser } from "payload-authjs";
import { SignInButton } from "./SignInButton";
import { SignOutButtonAuthjs } from "./SignOutButtonAuthjs";
import { SignOutButtonPayload } from "./SignOutButtonPayload";

const AuthOverview = async () => {
  const session = await auth();
  const payloadUser = await getPayloadUser();

  return (
    <div>
      <h3>Auth.js</h3>
      <p>{session?.user ? <SignOutButtonAuthjs /> : <SignInButton />}</p>
      <div style={{ background: "gray", padding: "5px", borderRadius: "10px" }}>
        {JSON.stringify(session?.user, null, 2)}
      </div>
      <br />
      <h3>Payload CMS</h3>
      <p>{payloadUser && <SignOutButtonPayload />}</p>
      <div style={{ background: "gray", padding: "5px", borderRadius: "10px" }}>
        {JSON.stringify(payloadUser, null, 2)}
      </div>
    </div>
  );
};

export default AuthOverview;
