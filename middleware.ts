import { NextRequest, NextResponse } from "next/server";
import * as jwt from "jsonwebtoken";

// Routes yang memerlukan authentication
const protectedRoutes = {
  buyer: ["/cart", "/checkout", "/orders", "/payment"],
  seller: [
    "/seller/dashboard",
    "/seller/products",
    "/seller/orders",
    "/seller/custom-products",
  ],
};

// Routes yang bisa diakses tanpa login
const publicRoutes = [
  "/login",
  "/register",
  "/seller/login",
  "/seller/register",
  "/products",
  "/",
];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check apakah route adalah public route
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Get token dari cookie atau header
  const token =
    request.cookies.get("token")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  // Jika tidak ada token, redirect ke login
  if (!token) {
    const loginUrl =
      pathname.startsWith("/seller/") && !pathname.startsWith("/seller/login")
        ? "/seller/login"
        : "/login";

    return NextResponse.redirect(new URL(loginUrl, request.url));
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as {
      userId: string;
      role: "buyer" | "seller";
    };

    // Check role-based access
    const isBuyerRoute = protectedRoutes.buyer.some((route) =>
      pathname.startsWith(route)
    );
    const isSellerRoute = protectedRoutes.seller.some((route) =>
      pathname.startsWith(route)
    );

    if (isBuyerRoute && decoded.role !== "buyer") {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (isSellerRoute && decoded.role !== "seller") {
      return NextResponse.redirect(new URL("/seller/login", request.url));
    }

    // Lanjutkan request
    return NextResponse.next();
  } catch (error) {
    console.error("Token verification failed:", error);

    const loginUrl = pathname.startsWith("/seller/")
      ? "/seller/login"
      : "/login";

    return NextResponse.redirect(new URL(loginUrl, request.url));
  }
}

// Config routes mana saja yang perlu middleware
export const config = {
  matcher: [
    // Protect semua routes kecuali yang di-exclude
    "/((?!_next/static|_next/image|favicon.ico|clear-storage.html).*)",
  ],
};
