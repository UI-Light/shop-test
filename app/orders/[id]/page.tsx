import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { formatDateTime, formatPrice } from "@/lib/format";
import { primaryButton } from "@/lib/styles";
import { createClient } from "@/lib/supabase/server";
import type { Order, OrderItem } from "@/lib/types";

export const metadata = {
  title: "Order confirmed · Shop",
};

/** The confirmation page shown straight after a successful checkout. */
export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // In Next.js 15 `params` is a promise, so it has to be awaited.
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/orders/${id}`)}`);
  }

  const { data: orders } = await supabase
    .from("orders")
    .select("id, total_cents, created_at")
    .eq("id", id)
    .returns<Order[]>();

  const order = orders?.[0];

  // Row Level Security means another person's order simply is not found here.
  if (!order) {
    notFound();
  }

  const { data: items } = await supabase
    .from("order_items")
    .select("id, name, price_cents, quantity")
    .eq("order_id", order.id)
    .order("name")
    .returns<OrderItem[]>();

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Thank you!</h1>
      <p className="mt-2 text-slate-600">
        Your order is confirmed. A confirmation email is on its way.
      </p>
      <p className="mt-1 font-mono text-sm text-slate-500">
        Order #{order.id.slice(0, 8)}
      </p>

      <ul className="mt-8 divide-y divide-slate-200 border-y border-slate-200">
        {(items ?? []).map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-4 py-3">
            <span className="text-slate-700">
              {item.name} <span className="text-slate-500">× {item.quantity}</span>
            </span>
            <span className="font-medium">
              {formatPrice(item.price_cents * item.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-right text-lg">
        Total <span className="font-semibold">{formatPrice(order.total_cents)}</span>
      </p>

      <p className="mt-6 text-sm text-slate-600">
        Placed {formatDateTime(order.created_at)}
      </p>

      <Link href="/" className={`${primaryButton} mt-8`}>
        Continue shopping
      </Link>
    </main>
  );
}
