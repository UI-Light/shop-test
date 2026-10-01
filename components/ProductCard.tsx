import Image from "next/image";
import { addToCart } from "@/app/cart/actions";
import { formatPrice } from "@/lib/format";
import { primaryButton } from "@/lib/styles";
import type { Product } from "@/lib/types";

/** A single product card: image, name, description, price and Add to cart. */
export default function ProductCard({ product }: { product: Product }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white">
      <Image
        src={product.image_url}
        alt={product.name}
        width={600}
        height={600}
        className="aspect-square w-full object-cover"
      />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <h2 className="font-medium">{product.name}</h2>
        <p className="flex-1 text-sm text-slate-600">{product.description}</p>
        <p className="font-semibold">{formatPrice(product.price_cents)}</p>
        <form action={addToCart}>
          <input type="hidden" name="productId" value={product.id} />
          <button type="submit" className={`${primaryButton} w-full`}>
            Add to cart
          </button>
        </form>
      </div>
    </article>
  );
}
