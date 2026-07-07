import { NextResponse } from "next/server";
import { verifyCookie } from "@/lib/adminCookie";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow login and logout endpoints
  if (pathname === "/api/admin/login" || pathname === "/api/admin/logout") {
    return NextResponse.next();
  }

  // Check admin routes
  const cookie = request.cookies.get("healinq_admin");

  if (!cookie) {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Verify cookie signature
  const verified = await verifyCookie(cookie.value);
  if (!verified) {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json(
        { success: false, message: "Invalid session" },
        { status: 401 }
      );
    }
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("healinq_admin");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
