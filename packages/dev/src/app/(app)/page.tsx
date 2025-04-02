import { Tabs } from "@/components/general/Tabs";
import { SessionProvider as AuthjsSessionProvider } from "next-auth/react";
import { getPayloadSession } from "payload-authjs";
import { PayloadSessionProvider } from "payload-authjs/client";
import { AuthjsSessionClient } from "./_components/auth/authjs/AuthjsSessionClient";
import { AuthjsSessionServer } from "./_components/auth/authjs/AuthjsSessionServer";
import { PayloadAuthProvider } from "./_components/auth/payload/PayloadAuthProvider";
import { PayloadSessionClient } from "./_components/auth/payload/PayloadSessionClient";
import { PayloadSessionClientWithUseAuth } from "./_components/auth/payload/PayloadSessionClientWithUseAuth";
import { PayloadSessionServer } from "./_components/auth/payload/PayloadSessionServer";
import { SignInOrOutButtons } from "./_components/auth/SignInOrOutButtons";
import ExampleList from "./_components/ExampleList";

const Page = async () => {
  return (
    <main className="container mt-5">
      <SignInOrOutButtons />

      <Tabs
        tabs={[
          {
            label: "Payload [getPayloadSession] (server)",
            content: <PayloadSessionServer />,
          },
          {
            label: "Payload [usePayloadSession] (client)",
            content: (
              <PayloadSessionProvider session={await getPayloadSession()}>
                <PayloadSessionClient />
              </PayloadSessionProvider>
            ),
          },
          {
            label: "Auth.js [auth] (server)",
            content: <AuthjsSessionServer />,
          },
          {
            label: "Auth.js [useSession] (client)",
            content: (
              <AuthjsSessionProvider>
                <AuthjsSessionClient />
              </AuthjsSessionProvider>
            ),
          },
          {
            label: "Payload [useAuth] (client)",
            content: (
              <PayloadAuthProvider>
                <PayloadSessionClientWithUseAuth />
              </PayloadAuthProvider>
            ),
          },
        ]}
      />

      <ExampleList />
    </main>
  );
};

export default Page;
