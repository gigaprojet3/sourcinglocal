import { auth } from "@/auth";
import { NextResponse } from "next/server";

/**
 * proxy.ts (ancien middleware.ts — renommé en Next.js 16)
 * Protège les routes /dashboard et /onboarding.
 * Redirige les utilisateurs non connectés vers /connexion.
 */
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const protectedPaths = ["/dashboard", "/onboarding"];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (isProtected && !session) {
    const loginUrl = new URL("/connexion", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Seller sans boutique → onboarding obligatoire
  if (
    session?.user?.role === "SELLER" &&
    !session.user.hasShop &&
    pathname.startsWith("/dashboard") &&
    !pathname.startsWith("/onboarding")
  ) {
    return NextResponse.redirect(new URL("/onboarding/boutique", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/:path*"],
};
