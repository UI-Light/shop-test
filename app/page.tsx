import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import SearchBox from "@/components/SearchBox";
import { createClient } from "@/lib/supabase/server";
import { secondaryButton } from "@/lib/styles";
import type { Product } from "@/lib/types";

/**
 * Tidies the search term before it reaches the database: the two SQL wildcard
 * characters are dropped, spaces are collapsed and the whole thing is capped.
 * A term that is only wildcards therefore becomes an empty string, which means
 * "show everything" rather than a search for a single space.
 */
function cleanSearch(raw: string | undefined): string {
  return (raw ?? "")
    .replace(/[%_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = cleanSearch(q);

  const supabase = await createClient();

  // Start from the base query, then narrow it down when searching.
  const base = supabase
    .from("products")
    .select("id, name, description, price_cents, image_url")
    .order("name");

  // ilike = case-insensitive LIKE, so "MUG" finds "Ceramic Mug".
  const request = query ? base.ilike("name", `%${query}%`) : base;

  const { data: products, error } = await request.returns<Product[]>();
  const isEmpty = !error && products?.length === 0;

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Shop</h1>
          <p className="mt-2 text-slate-600">Everything we sell, in one place.</p>
        </div>

        {query ? (
          <p aria-live="polite" className="text-sm text-slate-600">
            {products?.length ?? 0} result{products?.length === 1 ? "" : "s"} for{" "}
            <span className="font-medium text-slate-900">&ldquo;{query}&rdquo;</span>
          </p>
        ) : null}
      </div>

      <div className="mt-6 max-w-xl">
        <SearchBox query={query} />
      </div>

      {error ? (
        /* DESIGN.md: a plain sentence plus a clear next action. */
        <div className="mt-10 rounded-xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-lg font-medium">We could not load the products</h2>
          <p className="mt-1 text-sm text-slate-600">
            Something went wrong talking to the database. Please try again.
          </p>
          <Link href="/" className={`${secondaryButton} mt-4`}>
            Try again
          </Link>
        </div>
      ) : isEmpty && query ? (
        /* No search matches: say so and offer a way back. */
        <div className="mt-10 rounded-xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-lg font-medium">No products match &ldquo;{query}&rdquo;</h2>
          <p className="mt-1 text-sm text-slate-600">
            Check the spelling, or search for something shorter.
          </p>
          <Link href="/" className={`${secondaryButton} mt-4`}>
            Clear search
          </Link>
        </div>
      ) : isEmpty ? (
        <div className="mt-10 rounded-xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-lg font-medium">No products yet</h2>
          <p className="mt-1 text-sm text-slate-600">
            Nothing has been added to the shop so far. Please check back soon.
          </p>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
