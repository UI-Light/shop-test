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

/** Formats a database timestamp, e.g. "October 1, 2026 at 4:12 PM". */
export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}
