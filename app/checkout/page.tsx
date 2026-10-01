import Link from "next/link";
import { redirect } from "next/navigation";
import { placeOrder } from "./actions";
import { cartTotalCents, getCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { primaryButton } from "@/lib/styles";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Checkout · Shop",
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=%2Fcheckout");
  }

  const lines = await getCart(supabase, user.id);

  if (lines.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">Checkout</h1>
        <p className="mt-4 text-slate-600">
          Your cart is empty, so there is nothing to check out.
        </p>
        <Link href="/" className={`${primaryButton} mt-6`}>
          Browse products
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Checkout</h1>

      {error ? (
        <p className="mt-6 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          {error}
        </p>
      ) : null}

      <h2 className="mt-8 text-lg font-medium">Order summary</h2>

      <ul className="mt-4 divide-y divide-slate-200 border-y border-slate-200">
        {lines.map((line) => (
          <li
            key={line.id}
            className="flex items-center justify-between gap-4 py-3"
          >
            <span className="text-slate-700">
              {line.product.name}{" "}
              <span className="text-slate-500">× {line.quantity}</span>
            </span>
            <span className="font-medium">
              {formatPrice(line.product.price_cents * line.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-right text-lg">
        Total{" "}
        <span className="font-semibold">{formatPrice(cartTotalCents(lines))}</span>
      </p>

      <p className="mt-8 text-sm text-slate-600">
        This is a practice checkout - no card is charged and nothing is shipped.
      </p>

      <form action={placeOrder} className="mt-4">
        <button type="submit" className={primaryButton}>
          Place order
        </button>
      </form>

      <p className="mt-6 text-sm">
        <Link href="/cart" className="text-slate-600 underline">
          Back to cart
        </Link>
      </p>
    </main>
  );
}
