import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** The only pages a signed-out visitor may open. */
const PUBLIC_PATHS = ["/login", "/auth/callback"];

/**
 * Runs before every page. Its jobs:
 *  1. refresh the Supabase session cookie when the token expires, and
 *  2. send signed-out visitors to /login (everything except /login itself
 *     requires an account - the shop is not browsable when signed out).
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headersToSet) {
          // Supabase refreshed some cookies - copy them onto the response.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          // Cache headers, so a CDN never serves one user's session to another.
          Object.entries(headersToSet).forEach(([key, value]) =>
            response.headers.set(key, value),
          );
        },
      },
    },
  );

  // Important: getUser() must be called early so the refreshed cookies land
  // on the response we send back.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // Everything except Next's own assets and the static files in
  // /public/products (the photos and CREDITS.md). Credits stay readable while
  // signed out, which is what the CC BY-SA photo licences ask for.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|products/[^/]*\\.(?:svg|png|jpg|jpeg|gif|webp|md)$).*)",
  ],
};
