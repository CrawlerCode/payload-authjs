import NextAuth from "next-auth";
import { edgeAuthConfig } from "./auth/edge.config";

/**
 * This is an example middleware configuration. Rename this file to `middleware.ts` to enable it.
 *
 * @deprecated  Since Next.js 16, the `middleware` has been replaced with the `proxy` and uses the nodejs runtime. See `proxy.example.ts`
 */

export const { auth: middleware } = NextAuth(edgeAuthConfig);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|admin).*)"],
};
