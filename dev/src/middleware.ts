/* import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth: middleware } = NextAuth(authConfig);
export default middleware; */

import { NextResponse } from "next/server";

export default function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|admin/login|_next/static|_next/image|favicon.ico).*)"],
};
