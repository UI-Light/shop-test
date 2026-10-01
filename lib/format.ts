/**
 * Formats an integer number of cents as a price string.
 * 2400 -> "$24.00". Change the currency here if you sell in another one.
 */
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}
