import type { Metadata, Viewport } from "next";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { ToastProvider } from "@/components/Toast";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Shop",
    template: "%s · Shop",
  },
  description: "A simple shop: browse products, cart, checkout.",
  // Without these, iOS falls back to a screenshot when the shop is added to the
  // home screen, instead of using the violet "S" icon.
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  // iOS reads these once the shop is installed to the home screen.
  appleWebApp: {
    capable: true,
    title: "Shop",
    statusBarStyle: "default",
  },
};

/**
 * The violet accent, reused as the colour of the phone's status bar.
 * `viewportFit: cover` lets the layout run edge to edge; app/globals.css then
 * pads the sticky header and footer back out of the notch with safe-area insets.
 *
 * Next.js links the manifest from app/manifest.ts on its own.
 */
export const viewport: Viewport = {
  themeColor: "#7c3aed",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-white text-slate-900 antialiased">
        {/* Lets the shop be installed to a phone's home screen. */}
        <ServiceWorkerRegistrar />
        {/* One provider for the whole site, so any button can raise a toast. */}
        <ToastProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </ToastProvider>
      </body>
    </html>
  );
}
