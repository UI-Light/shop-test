"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cartTotalCents, getCart } from "@/lib/cart";
import { createClient } from "@/lib/supabase/server";

const TRY_AGAIN = "We could not place your order. Please try again.";

/**
 * Turns the cart into an order: saves the order, saves one row per item,
 * empties the cart, then sends the shopper to the confirmation page.
 * There is no real payment here - this is a practice checkout.
 */
export async function placeOrder() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=%2Fcheckout");
  }

  const lines = await getCart(supabase, user.id);
  if (lines.length === 0) {
    redirect("/cart");
  }

  // Prices come from the database, never from the browser, so nobody can
  // edit what they are charged.
  const total = cartTotalCents(lines);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({ user_id: user.id, total_cents: total })
    .select("id")
    .single<{ id: string }>();

  if (orderError || !order) {
    redirect(`/checkout?error=${encodeURIComponent(TRY_AGAIN)}`);
  }

  // The name and price are copied onto each line, so an old order never
  // changes if a product is later renamed, repriced or deleted.
  const { error: itemsError } = await supabase.from("order_items").insert(
    lines.map((line) => ({
      order_id: order.id,
      product_id: line.product.id,
      name: line.product.name,
      price_cents: line.product.price_cents,
      quantity: line.quantity,
    })),
  );

  if (itemsError) {
    // Put things back so we never leave an empty order behind.
    await supabase.from("orders").delete().eq("id", order.id);
    redirect(`/checkout?error=${encodeURIComponent(TRY_AGAIN)}`);
  }

  // Order saved - empty the cart.
  await supabase.from("cart_items").delete().eq("user_id", user.id);

  revalidatePath("/");
  revalidatePath("/cart");
  redirect(`/orders/${order.id}`);
}
