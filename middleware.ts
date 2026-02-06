import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Admin routes: require admin role; redirect non-admins to account
    if (pathname.startsWith("/admin")) {
      const role = (token?.role as string)?.toLowerCase();
      if (role !== "admin") {
        return NextResponse.redirect(new URL("/account", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    pages: { signIn: "/login" },
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/account/:path*",
    "/admin/:path*",
    "/checkout/:path*",
  ],
};
