import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Middleware to log out the user if they log out in the admin ui
 * TODO: Fix me
 */
export function logoutMiddleware(req: NextRequest): NextResponse {
  if (req.nextUrl.pathname !== "/admin/logout") return NextResponse.next();

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
}
