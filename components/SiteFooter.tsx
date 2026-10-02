import Link from "next/link";
import NavLink from "@/components/NavLink";
import { textLink } from "@/lib/styles";

/** The strip at the bottom of every page: what the shop is, and where to go. */
export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-50">
      <div className="mx-auto grid max-w-5xl gap-8 px-6 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div className="sm:col-span-2">
          <p className="text-base font-semibold">Shop</p>
          <p className="mt-2 max-w-xs text-sm text-slate-600">
            A small shop built with Next.js and Supabase. Sign in with Google to
            browse, then keep a cart that follows you between devices.
          </p>
        </div>

        <nav aria-labelledby="footer-shop">
          <p id="footer-shop" className="text-sm font-medium">
            Shop
          </p>
          <ul className="mt-3 flex flex-col items-start gap-2 text-sm text-slate-600">
            <li>
              <NavLink href="/">All products</NavLink>
            </li>
            <li>
              <NavLink href="/cart">Your cart</NavLink>
            </li>
            <li>
              <NavLink href="/checkout">Checkout</NavLink>
            </li>
          </ul>
        </nav>

        <nav aria-labelledby="footer-account">
          <p id="footer-account" className="text-sm font-medium">
            Account
          </p>
          <ul className="mt-3 flex flex-col items-start gap-2 text-sm text-slate-600">
            <li>
              <NavLink href="/login">Sign in with Google</NavLink>
            </li>
            <li>
              {/* Credit for the CC BY-SA photos is required, so it is here. */}
              <Link
                href="/products/CREDITS.md"
                className="rounded-md px-2 py-1 transition duration-150 hover:text-violet-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
              >
                Photo credits
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-slate-200">
        <p className="mx-auto max-w-5xl px-6 py-4 text-sm text-slate-600">
          &copy; {year} Shop. A practice project - no real payments are taken
          and nothing is shipped.{" "}
          <Link href="/products/CREDITS.md" className={textLink}>
            Photo credits
          </Link>
        </p>
      </div>
    </footer>
  );
}