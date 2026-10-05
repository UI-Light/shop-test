import type { MetadataRoute } from "next";

/**
 * The web app manifest - this is what makes the shop installable to a phone's
 * home screen. Next.js serves this at /manifest.webmanifest and links it
 * automatically.
 *
 * "display: standalone" is the important line: it opens the app without a
 * browser's address bar, which is what makes it feel like an app rather than a
 * bookmark. The icons come from scripts/make-app-icons.mjs.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Shop",
    short_name: "Shop",
    description: "A simple shop: browse products, cart, checkout.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#7c3aed",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        // Android crops this one into whatever shape the launcher uses, so the
        // logo sits inside the middle 80% with the colour edge to edge.
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}