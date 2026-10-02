import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import ActionForm from "@/components/ActionForm";
import SubmitButton from "@/components/SubmitButton";
import { removeItem, setQuantity } from "./actions";
import { cartTotalCents, getCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { primaryButton, secondaryButton } from "@/lib/styles";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Cart",
};

/** The + and - buttons: same size and shape, so the row stays steady. */
const stepperButton =
  "grid size-9 place-items-center rounded-lg border border-slate-300 text-slate-700 " +
  "transition duration-150 ease-out hover:border-slate-400 hover:bg-slate-50 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600";

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
      <div className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">Your cart</h1>
        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-lg font-medium">Your cart is empty</h2>
          <p className="mt-1 text-sm text-slate-600">
            Nothing here yet. Have a look at what we sell and add something you
            like.
          </p>
          <Link href="/" className={`${primaryButton} mt-4`}>
            Browse products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Your cart</h1>

      <ul className="mt-8 divide-y divide-slate-200 border-y border-slate-200">
        {lines.map((line) => (
          <li
            key={line.id}
            className="flex flex-wrap items-center gap-x-6 gap-y-4 py-5"
          >
            <Link
              href={`/products/${line.product.id}`}
              tabIndex={-1}
              aria-hidden="true"
              className="shrink-0"
            >
              <Image
                src={line.product.image_url}
                alt=""
                width={200}
                height={200}
                className="size-16 rounded-lg border border-slate-200 object-cover"
              />
            </Link>

            <div className="min-w-40 flex-1">
              <p className="font-medium">
                <Link
                  href={`/products/${line.product.id}`}
                  className="rounded transition duration-150 hover:text-violet-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
                >
                  {line.product.name}
                </Link>
              </p>
              <p className="text-sm text-slate-600">
                {formatPrice(line.product.price_cents)} each
              </p>
            </div>

            <div className="flex items-center gap-3">
              <ActionForm action={setQuantity} successMessage="Quantity updated.">
                <input type="hidden" name="itemId" value={line.id} />
                <input type="hidden" name="quantity" value={line.quantity - 1} />
                <SubmitButton
                  pendingLabel=""
                  aria-label={`Decrease ${line.product.name} quantity`}
                  className={stepperButton}
                >
                  &minus;
                </SubmitButton>
              </ActionForm>

              <span aria-live="polite" className="w-6 text-center font-medium">
                {line.quantity}
              </span>

              <ActionForm action={setQuantity} successMessage="Quantity updated.">
                <input type="hidden" name="itemId" value={line.id} />
                <input type="hidden" name="quantity" value={line.quantity + 1} />
                <SubmitButton
                  pendingLabel=""
                  aria-label={`Increase ${line.product.name} quantity`}
                  className={stepperButton}
                >
                  +
                </SubmitButton>
              </ActionForm>
            </div>

            <p className="w-24 text-right font-semibold">
              {formatPrice(line.product.price_cents * line.quantity)}
            </p>

            <ActionForm action={removeItem}>
              <input type="hidden" name="itemId" value={line.id} />
              <SubmitButton
                pendingLabel="Removing..."
                className={`${secondaryButton} px-3 py-1.5 text-slate-600`}
              >
                Remove
              </SubmitButton>
            </ActionForm>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <p className="text-lg">
          Total{" "}
          <span className="font-semibold">{formatPrice(cartTotalCents(lines))}</span>
        </p>
        <div className="flex items-center gap-3">
          <Link href="/" className={secondaryButton}>
            Keep shopping
          </Link>
          <Link href="/checkout" className={primaryButton}>
            Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
