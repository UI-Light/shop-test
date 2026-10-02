import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import SubmitButton from "@/components/SubmitButton";
import { placeOrder } from "./actions";
import { cartTotalCents, getCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { primaryButton, secondaryButton } from "@/lib/styles";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Checkout",
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
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">Checkout</h1>
        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-lg font-medium">There is nothing to check out</h2>
          <p className="mt-1 text-sm text-slate-600">
            Your cart is empty. Add something first and come back.
          </p>
          <Link href="/" className={`${primaryButton} mt-4`}>
            Browse products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Checkout</h1>

      {error ? (
        <p
          role="alert"
          className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
        >
          {error}
        </p>
      ) : null}

      <h2 className="mt-8 text-lg font-medium">Order summary</h2>

      <ul className="mt-4 divide-y divide-slate-200 border-y border-slate-200">
        {lines.map((line) => (
          <li
            key={line.id}
            className="flex items-center gap-4 py-4"
          >
            <Image
              src={line.product.image_url}
              alt=""
              width={200}
              height={200}
              className="size-12 shrink-0 rounded-lg border border-slate-200 object-cover"
            />
            <span className="flex-1 text-slate-700">
              {line.product.name}{" "}
              <span className="text-slate-500">&times; {line.quantity}</span>
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

      <p className="mt-8 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        This is a practice checkout - no card is asked for, nothing is charged
        and nothing is shipped.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <form action={placeOrder}>
          <SubmitButton
            pendingLabel="Placing order..."
            className={`${primaryButton} px-6`}
          >
            Place order
          </SubmitButton>
        </form>
        <Link href="/cart" className={secondaryButton}>
          Back to cart
        </Link>
      </div>
    </div>
  );
}
