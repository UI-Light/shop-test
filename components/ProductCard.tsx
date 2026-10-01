import Image from "next/image";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

/** A single product card: image, name, description and price. */
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
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h2 className="font-medium">{product.name}</h2>
        <p className="flex-1 text-sm text-slate-600">{product.description}</p>
        <p className="font-semibold">{formatPrice(product.price_cents)}</p>
      </div>
    </article>
  );
}
