import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = [
  "/dashboard",
  "/profile",
  "/reservations",
  "/admin",
];

const adminRoutes = [
  "/admin",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (isProtectedRoute) {

    const token = request.cookies.get("auth_token")?.value;
    
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
    
    if (isAdminRoute) {
      try {
        const response = await fetch(new URL("/api/auth/verify-token", request.url), {
          headers: {
            Cookie: `auth_token=${token}`,
          },
        });
        
        if (!response.ok) {
          return NextResponse.redirect(new URL("/auth/login", request.url));
        }
        
        const data = await response.json();
        
        if (!data.user || !data.user.role || !data.user.role.startsWith("admin")) {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }
      } catch (error) {
        console.error("خطا در بررسی نقش کاربر:", error);
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/reservations/:path*",
    "/admin/:path*",
  ],
};