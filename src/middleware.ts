import type { NextAuthResult } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

type Middleware = (req: NextRequest) => NextResponse;
type AuthjsMiddleware = NextAuthResult["auth"] | ReturnType<NextAuthResult["auth"]>;

/**
 * Middleware of payload-authjs
 *
 * Inline middleware
 * @example
 * // middleware.ts
 * export { default } from "payload-authjs/middleware";
 *
 * Middleware wrapper
 * @example
 * // middleware.ts
 * const { auth } = NextAuth(authConfig);
 * export default middleware(auth);
 *
 * Middleware wrapper with custom logic
 * @example
 * // middleware.ts
 * const { auth } = NextAuth(authConfig);
 *
 * export default middleware(
 *   auth((req) => {
 *     // My custom logic
 *   }),
 * );
 */
export default function middleware(
  arg: NextRequest | Middleware | AuthjsMiddleware | any,
): Middleware | NextResponse {
  // Inline middleware
  if (arg instanceof NextRequest) {
    return logoutMiddleware(arg) ?? NextResponse.next();
  }

  // Middleware wrapper
  if (typeof arg === "function") {
    return (req: NextRequest) => {
      const response = logoutMiddleware(req);
      if (response) return response;

      return (arg(req) as NextResponse | undefined) ?? NextResponse.next();
    };
  }

  throw new Error("Invalid argument for middleware");
}

/**
 * Middleware to log out the user if they log out in the admin ui
 */
const logoutMiddleware = (req: NextRequest): NextResponse | undefined => {
  if (req.nextUrl.pathname !== "/admin/logout") return undefined;

  const response = NextResponse.redirect(new URL("/", req.url));
  response.cookies.set("__Secure-authjs.session-token", "", {
    path: "/",
    expires: new Date(0),
    httpOnly: true,
    secure: true,
  });
  response.cookies.set("authjs.session-token", "", {
    path: "/",
    expires: new Date(0),
    httpOnly: true,
    secure: false,
  });

  return response;
};
