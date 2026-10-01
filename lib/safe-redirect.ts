/**
 * Only allow redirects to paths inside this site.
 * Stops a crafted ?next=https://evil.example from bouncing users off-site.
 */
export function safeNextPath(value: string | null | undefined): string {
  if (!value) return "/";
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}
