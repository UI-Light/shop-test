import Link from "next/link";
import { signOut } from "@/app/login/actions";
import { createClient } from "@/lib/supabase/server";
import { primaryButton } from "@/lib/styles";

/** Top bar: the shop name plus who is signed in. */
export default async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b border-slate-200">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 py-4">
        <Link href="/" className="font-semibold">
          Shop
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <span className="hidden text-slate-600 sm:inline">
                {user.email}
              </span>
              <form action={signOut}>
                <button type="submit" className={primaryButton}>
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link href="/login" className={primaryButton}>
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
