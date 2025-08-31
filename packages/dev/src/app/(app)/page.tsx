import { Tabs } from "@/components/general/Tabs";
import { AuthjsLogo } from "@/components/img/AuthjsLogo";
import { PayloadLogo } from "@/components/img/PayloadLogo";
import { SessionProvider as AuthjsSessionProvider } from "next-auth/react";
import { getPayloadSession } from "payload-authjs";
import { PayloadSessionProvider } from "payload-authjs/client";
import { AuthjsSessionClient } from "./_components/auth/authjs/AuthjsSessionClient";
import { AuthjsSessionServer } from "./_components/auth/authjs/AuthjsSessionServer";
import { PayloadAuthProvider } from "./_components/auth/payload/native/PayloadAuthProvider";
import { PayloadSessionClientWithUseAuthHook } from "./_components/auth/payload/native/PayloadSessionClientWithUseAuthHook";
import { PayloadSessionServerWithLocalApi } from "./_components/auth/payload/native/PayloadSessionServerWithLocalApi";
import { PayloadSessionClient } from "./_components/auth/payload/PayloadSessionClient";
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
            label: "getPayloadSession (server)",
            icon: <PayloadLogo />,
            content: <PayloadSessionServer />,
          },
          {
            label: "usePayloadSession (client)",
            icon: <PayloadLogo />,
            content: (
              <PayloadSessionProvider session={await getPayloadSession()}>
                <PayloadSessionClient />
              </PayloadSessionProvider>
            ),
          },
          {
            label: "payload.auth (server)",
            icon: <PayloadLogo />,
            content: <PayloadSessionServerWithLocalApi />,
          },
          {
            label: "useAuth (client)",
            icon: <PayloadLogo />,
            content: (
              <PayloadAuthProvider>
                <PayloadSessionClientWithUseAuthHook />
              </PayloadAuthProvider>
            ),
          },
          {
            label: "auth (server)",
            icon: <AuthjsLogo />,
            content: <AuthjsSessionServer />,
          },
          {
            label: "useSession (client)",
            icon: <AuthjsLogo />,
            content: (
              <AuthjsSessionProvider>
                <AuthjsSessionClient />
              </AuthjsSessionProvider>
            ),
          },
        ]}
      />

      <ExampleList />
    </main>
  );
};

export default Page;
