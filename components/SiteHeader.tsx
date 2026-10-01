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

  // How many items are in the cart, for the little "(2)" next to Cart.
  let cartCount = 0;
  if (user) {
    const { count } = await supabase
      .from("cart_items")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);
    cartCount = count ?? 0;
  }

  return (
    <header className="border-b border-slate-200">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 py-4">
        <Link href="/" className="font-semibold">
          Shop
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <Link href="/cart" className="text-slate-700 hover:underline">
                Cart{cartCount > 0 ? ` (${cartCount})` : ""}
              </Link>
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
