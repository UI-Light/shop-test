import type { SupabaseClient } from "@supabase/supabase-js";
import type { Product } from "./types";

/** One line of the cart: a cart row plus the product it points at. */
export type CartLine = {
  id: string;
  quantity: number;
  product: Product;
};

/**
 * Reads the signed-in user's cart and joins it to the products.
 * Done as two simple queries and a lookup Map rather than a nested select,
 * so the shape of the data is obvious.
 */
export async function getCart(
  supabase: SupabaseClient,
  userId: string,
): Promise<CartLine[]> {
  const { data: items } = await supabase
    .from("cart_items")
    .select("id, product_id, quantity")
    .eq("user_id", userId)
    .order("id")
    .returns<{ id: string; product_id: string; quantity: number }[]>();

  if (!items || items.length === 0) {
    return [];
  }

  const { data: products } = await supabase
    .from("products")
    .select("id, name, description, price_cents, image_url")
    .in(
      "id",
      items.map((item) => item.product_id),
    )
    .returns<Product[]>();

  const productById = new Map((products ?? []).map((p) => [p.id, p]));

  return items.flatMap((item) => {
    const product = productById.get(item.product_id);
    return product ? [{ id: item.id, quantity: item.quantity, product }] : [];
  });
}

/** What the whole cart costs, in cents. */
export function cartTotalCents(lines: CartLine[]): number {
  return lines.reduce(
    (total, line) => total + line.product.price_cents * line.quantity,
    0,
  );
}
