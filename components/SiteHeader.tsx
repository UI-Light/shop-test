import Link from "next/link";
import NavLink from "@/components/NavLink";
import SubmitButton from "@/components/SubmitButton";
import { signOut } from "@/app/login/actions";
import { createClient } from "@/lib/supabase/server";
import { primaryButton, secondaryButton } from "@/lib/styles";

/**
 * The bar across the top: the shop name, where to go, and who is signed in.
 * It sticks to the top of the page while you scroll.
 */
export default async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // How many items are in the cart, for the little count next to Cart.
  let cartCount = 0;
  if (user) {
    const { count } = await supabase
      .from("cart_items")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);
    cartCount = count ?? 0;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md text-lg font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-600"
        >
          <span
            aria-hidden="true"
            className="grid size-7 place-items-center rounded-md bg-violet-600 text-sm font-bold text-white"
          >
            S
          </span>
          Shop
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <NavLink href="/">Products</NavLink>

          <NavLink href="/cart">
            Cart
            {cartCount > 0 ? (
              <span className="ml-1.5 rounded-full bg-violet-100 px-1.5 py-0.5 text-xs font-medium text-violet-700">
                {cartCount}
              </span>
            ) : null}
          </NavLink>

          {user ? (
            <>
              <span className="ml-2 hidden max-w-40 truncate text-sm text-slate-600 md:inline">
                {user.email}
              </span>
              <form action={signOut} className="ml-2">
                <SubmitButton
                  pendingLabel="Signing out..."
                  className={secondaryButton}
                >
                  Sign out
                </SubmitButton>
              </form>
            </>
          ) : (
            <Link href="/login" className={`${primaryButton} ml-2`}>
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
