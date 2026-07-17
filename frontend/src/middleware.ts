import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE } from "@/constants/api";
import { ROUTES } from "@/constants/routes";

const publicPaths = [ROUTES.LOGIN, ROUTES.REGISTER];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const isPublic = publicPaths.some((path) => pathname.startsWith(path));

  if (!token && !isPublic) {
    return NextResponse.redirect(new URL(ROUTES.LOGIN, request.url));
  }

  if (token && (pathname === ROUTES.LOGIN || pathname === ROUTES.REGISTER)) {
    return NextResponse.redirect(new URL(ROUTES.DASHBOARD, request.url));
  }

  if (pathname === ROUTES.HOME) {
    return NextResponse.redirect(
      new URL(token ? ROUTES.DASHBOARD : ROUTES.LOGIN, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/dashboard",
    "/dashboard/:path*",
    "/projects",
    "/projects/:path*",
    "/tasks",
    "/tasks/:path*",
  ],
};
