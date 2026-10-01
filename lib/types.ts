/** One row from the `products` table - see supabase/schema.sql. */
export type Product = {
  id: string;
  name: string;
  description: string;
  price_cents: number;
  image_url: string;
};
