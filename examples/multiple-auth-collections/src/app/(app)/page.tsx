import { auth } from "@/auth.customers";
import { getPayloadSession } from "payload-authjs";
import { SignInButton } from "./_components/SignInButton";
import { SignOutButton } from "./_components/SignOutButton";

const Page = async () => {
  const authjsSession = await auth();
  const payloadSession = await getPayloadSession({ userCollectionSlug: "customers" });

  return (
    <main>
      {payloadSession ? <SignOutButton /> : <SignInButton />}
      <br />
      <h3>Auth.js Session (Customer)</h3>
      <pre>{JSON.stringify(authjsSession, null, 2)}</pre>
      <br />
      <h3>Payload CMS Session (Customer)</h3>
      <pre>{JSON.stringify(payloadSession, null, 2)}</pre>
    </main>
  );
};

export default Page;
