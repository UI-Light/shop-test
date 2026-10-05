"use client";

import { useEffect, useState } from "react";
import { secondaryButton } from "@/lib/styles";

/**
 * The event Chrome fires when it decides the shop is installable.
 *
 * It is not part of TypeScript's DOM types, so the few members we use are
 * described here rather than pulled from a package.
 */
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/**
 * Shows an "Install app" button once the browser says the shop is installable.
 *
 * Chrome decides this itself and tells us through the `beforeinstallprompt`
 * event. If the button is not on the screen, the browser has not decided the
 * shop is ready yet - nothing is hidden by mistake.
 *
 * A common reason for that on a phone: the service worker is registered during
 * the first visit, but Chrome only judges the app installable on a page the
 * service worker already controls. Reloading the page once usually settles it.
 *
 * The button hides itself once the app is installed, or when the visitor
 * dismisses the install, and it never appears on iOS, where there is no such
 * event - there the route is Share -> Add to Home Screen.
 */
export default function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      // Stops Chrome showing its own small banner, so the shop decides when to
      // ask. Without this the event is discarded and never fires again.
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };

    // Fires once the app is actually on the home screen.
    const onAppInstalled = () => setInstallEvent(null);

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  if (!installEvent) {
    return null;
  }

  async function install() {
    if (!installEvent || busy) return;
    setBusy(true);
    try {
      await installEvent.prompt();
      const choice = await installEvent.userChoice;
      // Either way, do not ask again this visit.
      if (choice.outcome !== "accepted") {
        setInstallEvent(null);
      }
    } catch {
      setInstallEvent(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm text-slate-600">
        Shop on your phone. Install it for a full-screen app with no address
        bar.
      </p>
      <button
        type="button"
        onClick={install}
        disabled={busy}
        aria-busy={busy}
        className={`${secondaryButton} mt-3 w-full disabled:cursor-not-allowed disabled:opacity-60`}
      >
        {busy ? "Installing..." : "Install app"}
      </button>
    </div>
  );
}