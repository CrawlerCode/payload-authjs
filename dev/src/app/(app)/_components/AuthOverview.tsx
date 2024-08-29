import { auth } from "@/auth";
import { DataFromCollectionSlug } from "payload";
import { getPayloadUser } from "../../../../../src";
import { SignInButton } from "./SignInButton";
import { SignOutButton } from "./SignOutButton";

const AuthOverview = async () => {
  const session = await auth();
  const payloadUser = await getPayloadUser<DataFromCollectionSlug<"users">>();

  return (
    <div>
      <p>{session?.user ? <SignOutButton /> : <SignInButton />}</p>
      <br />
      <h3>Auth.js</h3>
      <div style={{ background: "gray", padding: "5px", borderRadius: "10px" }}>
        {JSON.stringify(session?.user, null, 2)}
      </div>
      <br />
      <h3>Payload CMS</h3>
      <div style={{ background: "gray", padding: "5px", borderRadius: "10px" }}>
        {JSON.stringify(payloadUser, null, 2)}
      </div>
    </div>
  );
};

export default AuthOverview;
