import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // const userId = cookies().get("userId");
  const isLoggedIn = request.cookies.has("userId");
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // if (userId && userId.value) {
  return NextResponse.next();
  // }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: "/((?!api|_next/static|_next/image|favicon.ico|login).*)",
};
