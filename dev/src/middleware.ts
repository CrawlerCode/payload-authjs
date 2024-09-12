import NextAuth from "next-auth";
import middleware from "./../../src/middleware";
import { authConfig } from "./auth.config";

export const config = {
  matcher: ["/((?!api|admin/login|_next/static|_next/image|favicon.ico).*)"],
};

/* export default middleware; */

const { auth } = NextAuth(authConfig);

export default middleware(auth);

/* export default middleware(
  auth(req => {
    // My custom logic
  }),
);
 */

/* export default middleware((req: NextRequest) => {
  // My custom logic
  return NextResponse.next();
}); */
