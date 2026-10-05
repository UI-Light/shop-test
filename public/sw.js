/**
 * A deliberately "dumb" service worker.
 *
 * It exists only so the browser is willing to install the shop to the home
 * screen - Chrome will not offer "Install app" without one. It caches nothing:
 * every request is passed straight through to the network.
 *
 * That is a considered decision, not laziness. The shop is behind a login and
 * every page is personalised (the cart, the order history), so anything cached
 * risks showing a stale cart, or on a shared phone, showing one person's cart to
 * another. Passing everything through means there is no cache to get wrong.
 *
 * If offline support is ever wanted, add it here, with an allowlist.
 */

self.addEventListener("install", () => {
  // Take over straight away rather than waiting for every tab to close.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Anything that is not a plain GET is left to the browser untouched.
  if (request.method !== "GET") return;

  // Requests to another origin (Supabase, for example) are left alone too.
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Straight to the network, and the response is handed straight back.
  // Nothing is written to the Cache API.
  event.respondWith(fetch(request));
});