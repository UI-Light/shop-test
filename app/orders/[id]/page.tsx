import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { formatDateTime, formatPrice } from "@/lib/format";
import { primaryButton } from "@/lib/styles";
import { createClient } from "@/lib/supabase/server";
import type { Order, OrderItem } from "@/lib/types";

export const metadata = {
  title: "Order confirmed",
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
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex items-center gap-3">
        <span
          className="grid size-10 shrink-0 place-items-center rounded-full bg-violet-100 text-violet-700"
          aria-hidden="true"
        >
          {/* An SVG rather than the "&check;" character, so it renders the same
              on every machine instead of depending on the installed fonts. */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-6"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Thank you!</h1>
          <p className="text-slate-600">
            Your order is confirmed. A confirmation email is on its way.
          </p>
        </div>
      </div>

      <p className="mt-4 font-mono text-sm text-slate-500">
        Order #{order.id.slice(0, 8)}
      </p>

      <ul className="mt-8 divide-y divide-slate-200 border-y border-slate-200">
        {(items ?? []).map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-4 py-3">
            <span className="text-slate-700">
              {item.name}{" "}
              <span className="text-slate-500">&times; {item.quantity}</span>
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

      <p className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <span aria-hidden="true" className="mt-0.5 shrink-0">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4"
          >
            <path d="M4 4h16v16H4z" />
            <path d="m4 6 8 6 8-6" />
          </svg>
        </span>
        <span>
          <strong className="font-medium">Check your spam folder.</strong> This is
          a practice shop on a Mailgun sandbox domain, so the confirmation email
          often lands in Junk or Spam the first time. Mark it as
          &quot;not spam&quot; and later emails will arrive normally.
        </span>
      </p>

      <p className="mt-6 text-sm text-slate-600">
        Placed {formatDateTime(order.created_at)}
      </p>

      <Link href="/" className={`${primaryButton} mt-8`}>
        Continue shopping
      </Link>
    </div>
  );
}
