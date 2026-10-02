"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cartTotalCents, getCart, type CartLine } from "@/lib/cart";
import { sendOrderConfirmation } from "@/lib/mail";
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

  // The order is already safely in the database by this point, so the email is
  // sent afterwards on purpose. If Mailgun is slow, down, or misconfigured the
  // shopper still gets their order and still sees the confirmation page - the
  // email just does not arrive. `sendOrderConfirmation` never throws, so there
  // is nothing here that can undo the order.
  await emailConfirmation({ user, orderId: order.id, lines, total });

  revalidatePath("/");
  revalidatePath("/cart");
  redirect(`/orders/${order.id}`);
}

/**
 * Sends the confirmation email and records what happened in the server log.
 * Kept separate from `placeOrder` so the "email must never break the order"
 * rule is obvious in one small place.
 */
async function emailConfirmation({
  user,
  orderId,
  lines,
  total,
}: {
  user: { email?: string | null; user_metadata?: Record<string, unknown> };
  orderId: string;
  lines: CartLine[];
  total: number;
}) {
  if (!user.email) {
    console.warn("[order] no email address on the account, skipped the email");
    return;
  }

  // Google puts the full name in user_metadata, under a few possible keys.
  const metadata = user.user_metadata ?? {};
  const name =
    (metadata.full_name as string | undefined) ??
    (metadata.name as string | undefined) ??
    null;

  // Rebuild the site address from the incoming request so the email can link
  // back to the confirmation page. Works on localhost and on Vercel.
  const requestHeaders = await headers();
  const host = requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  const orderUrl = host ? `${protocol}://${host}/orders/${orderId}` : undefined;

  const result = await sendOrderConfirmation({
    to: user.email,
    name,
    orderId,
    totalCents: total,
    lines: lines.map((line) => ({
      name: line.product.name,
      quantity: line.quantity,
      priceCents: line.product.price_cents,
    })),
    orderUrl,
  });

  if (result.ok) {
    console.log(`[order] confirmation email queued for ${user.email} (${result.id})`);
  } else {
    // This is the one place an email failure is allowed to be visible. The
    // order has already been saved, so the shopper never sees this.
    console.error(`[order] confirmation email NOT sent: ${result.error}`);
  }
}
