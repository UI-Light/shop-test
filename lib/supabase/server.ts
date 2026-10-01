import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase client for the server (Server Components and Route Handlers).
 *
 * In Next.js 15 `cookies()` is async, so this helper is async too:
 *   const supabase = await createClient();
 *
 * The anon key is used here on purpose - Row Level Security in the database
 * decides what this client may read or write.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Components are not allowed to set cookies. This is
            // expected and harmless; the login flow (M3) writes them in a
            // Route Handler / middleware instead.
          }
        },
      },
    },
  );
}
