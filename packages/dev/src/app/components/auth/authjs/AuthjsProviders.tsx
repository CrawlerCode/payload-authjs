import { SessionProvider } from "next-auth/react";
import { type ReactNode } from "react";

export const AuthjsProviders = ({ children }: { children: ReactNode }) => {
  return <SessionProvider>{children}</SessionProvider>;
};
