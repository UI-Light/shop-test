import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { removeItem, setQuantity } from "./actions";
import { cartTotalCents, getCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { primaryButton } from "@/lib/styles";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Cart · Shop",
};

export default async function CartPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The middleware already does this, but it is good to be explicit.
  if (!user) {
    redirect("/login?next=%2Fcart");
  }

  const lines = await getCart(supabase, user.id);

  if (lines.length === 0) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">Your cart</h1>
        <p className="mt-4 text-slate-600">Your cart is empty.</p>
        <Link href="/" className={`${primaryButton} mt-6`}>
          Browse products
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Your cart</h1>

      <ul className="mt-8 divide-y divide-slate-200 border-y border-slate-200">
        {lines.map((line) => (
          <li
            key={line.id}
            className="flex flex-wrap items-center gap-x-6 gap-y-3 py-4"
          >
            <Image
              src={line.product.image_url}
              alt={line.product.name}
              width={600}
              height={600}
              className="h-16 w-16 rounded-md border border-slate-200 object-cover"
            />

            <div className="min-w-40 flex-1">
              <p className="font-medium">{line.product.name}</p>
              <p className="text-sm text-slate-600">
                {formatPrice(line.product.price_cents)} each
              </p>
            </div>

            <form action={setQuantity} className="flex items-center gap-2">
              <input type="hidden" name="itemId" value={line.id} />
              <button
                type="submit"
                name="quantity"
                value={line.quantity - 1}
                aria-label={`Decrease ${line.product.name} quantity`}
                className="h-8 w-8 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                −
              </button>
              <span className="w-8 text-center">{line.quantity}</span>
              <button
                type="submit"
                name="quantity"
                value={line.quantity + 1}
                aria-label={`Increase ${line.product.name} quantity`}
                className="h-8 w-8 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                +
              </button>
            </form>

            <p className="w-20 text-right font-semibold">
              {formatPrice(line.product.price_cents * line.quantity)}
            </p>

            <form action={removeItem}>
              <input type="hidden" name="itemId" value={line.id} />
              <button
                type="submit"
                className="text-sm text-slate-600 underline hover:text-slate-900"
              >
                Remove
              </button>
            </form>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <p className="text-lg">
          Total <span className="font-semibold">{formatPrice(cartTotalCents(lines))}</span>
        </p>
        <Link href="/checkout" className={primaryButton}>
          Checkout
        </Link>
      </div>
    </main>
  );
}
