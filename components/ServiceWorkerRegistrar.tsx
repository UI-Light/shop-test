"use client";

import { useEffect } from "react";

/**
 * Registers /sw.js once the site has loaded.
 *
 * A service worker is needed before a browser will offer "Install app", but it
 * is not something the app itself needs to know about. Keeping the registration
 * here means the rest of the site stays server components.
 *
 * It only runs in production. During development a stale service worker is
 * confusing, because it can keep serving an old build while you are changing
 * the code.
 */
export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch((error) => {
      // Not being able to install the app is not worth breaking the page over.
      console.warn("[pwa] service worker did not register:", error.message);
    });
  }, []);

  return null;
}