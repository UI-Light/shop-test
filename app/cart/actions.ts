"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

/** The cart badge in the header and the cart page both need refreshing. */
function refreshCartViews() {
  revalidatePath("/");
  revalidatePath("/cart");
}

/** Adds one of this product to the signed-in user's cart. */
export async function addToCart(formData: FormData) {
  const productId = String(formData.get("productId") ?? "");
  if (!productId) return;

  const { supabase, user } = await requireUser();

  const { data: existing } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    // Already in the cart - just add one more.
    await supabase
      .from("cart_items")
      .update({ quantity: existing.quantity + 1 })
      .eq("id", existing.id);
  } else {
    await supabase
      .from("cart_items")
      .insert({ user_id: user.id, product_id: productId, quantity: 1 });
  }

  refreshCartViews();
}

/** Sets a line's quantity. A quantity of zero or less removes the line. */
export async function setQuantity(formData: FormData) {
  const itemId = String(formData.get("itemId") ?? "");
  const quantity = Number(formData.get("quantity") ?? 0);
  if (!itemId) return;

  const { supabase } = await requireUser();

  if (quantity <= 0) {
    await supabase.from("cart_items").delete().eq("id", itemId);
  } else {
    await supabase.from("cart_items").update({ quantity }).eq("id", itemId);
  }

  refreshCartViews();
}

/** Removes a line from the cart completely. */
export async function removeItem(formData: FormData) {
  const itemId = String(formData.get("itemId") ?? "");
  if (!itemId) return;

  const { supabase } = await requireUser();
  await supabase.from("cart_items").delete().eq("id", itemId);

  refreshCartViews();
}
