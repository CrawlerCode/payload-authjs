import { auth } from "@/auth";
import { getPayloadUser } from "payload-authjs";
import { SignInButton } from "./_components/SignInButton";
import { SignOutButton } from "./_components/SignOutButton";

const Page = async () => {
  const session = await auth();
  const payloadUser = await getPayloadUser();

  return (
    <main>
      {payloadUser ? <SignOutButton /> : <SignInButton />}
      <br />
      <h3>Auth.js Session</h3>
      <pre>{JSON.stringify(session?.user, null, 2)}</pre>
      <br />
      <h3>Payload CMS User</h3>
      <pre>{JSON.stringify(payloadUser, null, 2)}</pre>
    </main>
  );
};

export default Page;
