import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware to log out the user if they log out in the admin ui
 * TODO: Fix me
 */
export function logoutMiddleware(req: NextRequest) {
  if (req.nextUrl.pathname !== "/admin/logout") return;

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
