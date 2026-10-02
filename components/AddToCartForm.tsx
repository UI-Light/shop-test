"use client";

import { useState } from "react";
import ActionForm from "@/components/ActionForm";
import SubmitButton from "@/components/SubmitButton";
import { addToCart } from "@/app/cart/actions";
import { primaryButton } from "@/lib/styles";
import type { Product } from "@/lib/types";

const MAX_QUANTITY = 20;

/**
 * The Add to cart box on a product page (S1). The shopper picks how many they
 * want with the + / - buttons, then adds them.
 *
 * "use client" because the chosen quantity lives in the browser until the form
 * is sent. Everything else on this page is still a server component.
 */
export default function AddToCartForm({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);

  return (
    <ActionForm
      action={addToCart}
      successMessage={`Added ${quantity} × ${product.name} to your cart.`}
    >
      <input type="hidden" name="productId" value={product.id} />
      <input type="hidden" name="quantity" value={quantity} />

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 rounded-lg border border-slate-300">
          <button
            type="button"
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
            className="grid size-10 place-items-center rounded-l-lg text-lg transition duration-150 ease-out hover:bg-slate-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-violet-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            &minus;
          </button>

          <span aria-live="polite" className="w-10 text-center font-medium">
            {quantity}
          </span>

          <button
            type="button"
            onClick={() =>
              setQuantity((current) => Math.min(MAX_QUANTITY, current + 1))
            }
            disabled={quantity >= MAX_QUANTITY}
            aria-label="Increase quantity"
            className="grid size-10 place-items-center rounded-r-lg text-lg transition duration-150 ease-out hover:bg-slate-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-violet-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            +
          </button>
        </div>

        <SubmitButton
          pendingLabel="Adding..."
          className={`${primaryButton} flex-1 sm:flex-none sm:px-8`}
        >
          Add to cart
        </SubmitButton>
      </div>

      <p className="mt-3 text-sm text-slate-600">
        This is a practice shop - nothing is charged and nothing is shipped.
      </p>
    </ActionForm>
  );
}