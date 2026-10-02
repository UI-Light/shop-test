"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/action-state";
import { createClient } from "@/lib/supabase/server";

const ADD_FAILED = "We could not add that to your cart. Please try again.";
const UPDATE_FAILED = "We could not update your cart. Please try again.";

/** Signs-in check shared by every cart action. */
async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return { supabase, user };
}

/**
 * The cart badge in the header and the cart page both need refreshing.
 * "layout" means "this page and everything inside it", which covers the
 * header as well - it shows how many items are in the cart.
 */
function refreshCartViews() {
  revalidatePath("/", "layout");
}

/** Adds this product to the signed-in user's cart. */
export async function addToCart(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const productId = String(formData.get("productId") ?? "");
  // The product page lets the shopper pick how many; the card adds just one.
  const wanted = Number(formData.get("quantity") ?? 1);
  const quantity = Number.isFinite(wanted)
    ? Math.min(Math.max(Math.trunc(wanted), 1), 20)
    : 1;

  if (!productId) {
    return { status: "error", message: "That product could not be found." };
  }

  const { supabase, user } = await requireUser();

  // Read the name from the database, not the browser, so the toast can name
  // the product. It also proves the product still exists.
  const { data: product } = await supabase
    .from("products")
    .select("id, name")
    .eq("id", productId)
    .maybeSingle();

  if (!product) {
    return { status: "error", message: "That product is no longer available." };
  }

  const { data: existing } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  const { error } = existing
    ? await supabase
        .from("cart_items")
        .update({ quantity: existing.quantity + quantity })
        .eq("id", existing.id)
    : await supabase
        .from("cart_items")
        .insert({ user_id: user.id, product_id: productId, quantity });

  if (error) {
    return { status: "error", message: ADD_FAILED };
  }

  refreshCartViews();
  return {
    status: "success",
    message:
      quantity === 1
        ? `Added ${product.name} to your cart.`
        : `Added ${quantity} × ${product.name} to your cart.`,
  };
}

/** Sets a line's quantity. A quantity of zero or less removes the line. */
export async function setQuantity(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const itemId = String(formData.get("itemId") ?? "");
  const quantity = Number(formData.get("quantity") ?? 0);
  if (!itemId) {
    return { status: "error", message: "That cart line could not be found." };
  }

  const { supabase } = await requireUser();

  const { error } =
    quantity <= 0
      ? await supabase.from("cart_items").delete().eq("id", itemId)
      : await supabase.from("cart_items").update({ quantity }).eq("id", itemId);

  if (error) {
    return { status: "error", message: UPDATE_FAILED };
  }

  refreshCartViews();
  return {
    status: "success",
    message: quantity <= 0 ? "Item removed from your cart." : "Cart updated.",
  };
}

/** Removes a line from the cart completely. */
export async function removeItem(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const itemId = String(formData.get("itemId") ?? "");
  if (!itemId) {
    return { status: "error", message: "That cart line could not be found." };
  }

  const { supabase } = await requireUser();
  const { error } = await supabase.from("cart_items").delete().eq("id", itemId);

  if (error) {
    return { status: "error", message: UPDATE_FAILED };
  }

  refreshCartViews();
  return { status: "success", message: "Item removed from your cart." };
}
