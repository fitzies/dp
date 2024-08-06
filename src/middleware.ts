import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "./lib/server";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // const userId = cookies().get("userId");
  const token = request.cookies.get("token")?.value;
  // if (!isLoggedIn) {
  //   return NextResponse.redirect(new URL("/login", request.url));
  // }

  // // if (userId && userId.value) {
  // return NextResponse.next();
  // // }
  try {
    const a = verifyToken(token);
    console.log("\n\n\n", a);
    return NextResponse.next();
  } catch (err) {
    console.log(err);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: "/((?!api|_next/static|_next/image|favicon.ico|login).*)",
};
