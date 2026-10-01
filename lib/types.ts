/** One row from the `products` table - see supabase/schema.sql. */
export type Product = {
  id: string;
  name: string;
  description: string;
  price_cents: number;
  image_url: string;
};

/** One row from the `orders` table. */
export type Order = {
  id: string;
  total_cents: number;
  created_at: string;
};

/** One row from the `order_items` table (name and price are copied in). */
export type OrderItem = {
  id: string;
  name: string;
  price_cents: number;
  quantity: number;
};
