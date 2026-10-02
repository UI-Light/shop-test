import Image from "next/image";
import Link from "next/link";
import ActionForm from "@/components/ActionForm";
import SubmitButton from "@/components/SubmitButton";
import { addToCart } from "@/app/cart/actions";
import { formatPrice } from "@/lib/format";
import { card, primaryButton } from "@/lib/styles";
import type { Product } from "@/lib/types";

/**
 * A single product card: photo, name, price and Add to cart.
 * The photo and the name both link through to the product page (S1).
 */
export default function ProductCard({ product }: { product: Product }) {
  return (
    <article className={`${card} group flex flex-col overflow-hidden`}>
      <Link
        href={`/products/${product.id}`}
        tabIndex={-1}
        aria-hidden="true"
        className="block overflow-hidden"
      >
        <Image
          src={product.image_url}
          alt=""
          width={800}
          height={800}
          className="aspect-square w-full object-cover transition duration-200 ease-out group-hover:scale-[1.03]"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <h2 className="text-base font-medium">
          <Link
            href={`/products/${product.id}`}
            className="rounded transition duration-150 ease-out hover:text-violet-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
          >
            {product.name}
          </Link>
        </h2>

        <p className="flex-1 text-sm text-slate-600">{product.description}</p>

        <p className="mt-1 text-lg font-semibold">
          {formatPrice(product.price_cents)}
        </p>

        <ActionForm action={addToCart} className="mt-3">
          <input type="hidden" name="productId" value={product.id} />
          <SubmitButton pendingLabel="Adding..." className={`${primaryButton} w-full`}>
            Add to cart
          </SubmitButton>
        </ActionForm>
      </div>
    </article>
  );
}
