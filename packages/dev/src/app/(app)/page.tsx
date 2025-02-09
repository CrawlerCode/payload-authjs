import { PayloadSessionProvider } from "payload-authjs";
import { AuthjsProviders } from "../components/auth/authjs/AuthjsProviders";
import { AuthjsSessionClient } from "../components/auth/authjs/AuthjsSessionClient";
import { AuthjsSessionServer } from "../components/auth/authjs/AuthjsSessionServer";
import { PayloadAuthProvider } from "../components/auth/payload/PayloadAuthProvider";
import { PayloadSessionClientWithUseAuth } from "../components/auth/payload/PayloadSessionClientWithUseAuth";
import { PayloadSessionClientWithUsePayloadSession } from "../components/auth/payload/PayloadSessionClientWithUsePayloadSession";
import { PayloadSessionServer } from "../components/auth/payload/PayloadSessionServer";
import { SignInOrOutButtons } from "../components/auth/SignInOrOutButtons";
import ExampleList from "../components/ExampleList";
import { Tabs } from "../components/general/Tabs";

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
              <PayloadSessionProvider>
                <PayloadSessionClientWithUsePayloadSession />
              </PayloadSessionProvider>
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
          {
            label: "Auth.js [auth] (server)",
            content: <AuthjsSessionServer />,
          },
          {
            label: "Auth.js [useSession] (client)",
            content: (
              <AuthjsProviders>
                <AuthjsSessionClient />
              </AuthjsProviders>
            ),
          },
        ]}
      />

      <ExampleList />
    </main>
  );
};

export default Page;
