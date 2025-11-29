/**
 * This is an example proxy configuration. Rename this file to `proxy.ts` to enable it.
 */

export { auth as proxy } from "./auth";

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|admin).*)"],
};
