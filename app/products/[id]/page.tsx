import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCartForm from "@/components/AddToCartForm";
import { formatPrice } from "@/lib/format";
import { card, textLink } from "@/lib/styles";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";

/** The name shown in the browser tab. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("name")
    .eq("id", id)
    .maybeSingle();

  return { title: data?.name ?? "Product" };
}

/** Product ids are UUIDs, so anything else is not a product page. */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** One product on its own page (S1): big photo, description, quantity, add. */
export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // In Next.js 15 `params` is a promise, so it has to be awaited.
  const { id } = await params;

  // This route shares its path with the photo files in /public/products, so
  // anything that is not a UUID is a missing page rather than a product.
  if (!UUID.test(id)) {
    notFound();
  }

  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, name, description, price_cents, image_url")
    .eq("id", id)
    .returns<Product[]>();

  const product = products?.[0];
  if (!product) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-sm">
        <Link href="/" className={textLink}>
          &larr; All products
        </Link>
      </p>

      <div className="mt-6 grid gap-8 md:grid-cols-2 md:gap-12">
        <Image
          src={product.image_url}
          alt={product.name}
          width={800}
          height={800}
          priority
          className="aspect-square w-full rounded-xl border border-slate-200 object-cover"
        />

        <div className="flex flex-col">
          <h1 className="text-3xl font-semibold tracking-tight">
            {product.name}
          </h1>

          <p className="mt-3 text-2xl font-semibold">
            {formatPrice(product.price_cents)}
          </p>

          <p className="mt-4 text-base text-slate-600">{product.description}</p>

          <div className={`${card} mt-8 p-5`}>
            <AddToCartForm product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}