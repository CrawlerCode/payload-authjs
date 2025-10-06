import NextAuth from "next-auth";
import { edgeAuthConfig } from "./auth/edge.config";

export const { auth: middleware } = NextAuth(edgeAuthConfig);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|admin).*)"],
};
