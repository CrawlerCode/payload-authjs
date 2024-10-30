import type { NextAuthResult } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

type Middleware = (req: NextRequest) => NextResponse;
type AuthjsMiddleware = NextAuthResult["auth"] | ReturnType<NextAuthResult["auth"]>;

/**
 * Middleware of payload-authjs
 *
 * @deprecated This middleware is no longer needed and will be removed in the future
 */
export default function middleware(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-redundant-type-constituents
  arg: NextRequest | Middleware | AuthjsMiddleware | any,
): Middleware | NextResponse {
  // Inline middleware
  if (arg instanceof NextRequest) {
    return NextResponse.next();
  }

  // Middleware wrapper
  if (typeof arg === "function") {
    return (req: NextRequest) => {
      return (arg(req) as NextResponse | undefined) ?? NextResponse.next();
    };
  }

  throw new Error("Invalid argument for middleware");
}
