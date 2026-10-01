import ProductCard from "@/components/ProductCard";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";

export default async function Home() {
  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, description, price_cents, image_url")
    .order("name")
    .returns<Product[]>();

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Shop</h1>
      <p className="mt-2 text-slate-600">Everything we sell, in one place.</p>

      {error ? (
        /* Placeholder error state - M7 makes this friendlier. */
        <p className="mt-8 text-sm text-slate-600">
          Sorry, we could not load the products just now. Please refresh the
          page.
        </p>
      ) : products?.length === 0 ? (
        /* Placeholder empty state - M7 makes this friendlier. */
        <p className="mt-8 text-sm text-slate-600">No products yet.</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}
