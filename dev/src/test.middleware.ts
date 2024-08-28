export const config = {
  matcher: ["/((?!api|admin/login|_next/static|_next/image|favicon.ico).*)"],
};

export { logoutMiddleware as default } from "../../src/index";
