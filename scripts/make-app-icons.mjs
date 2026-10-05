#!/usr/bin/env node
/**
 * Draws the app icons used by the web app manifest.
 *
 *   node scripts/make-app-icons.mjs
 *
 * They are generated rather than hand-drawn so they always match the brand:
 * a violet square with a bold white "S", the same mark as the one in the site
 * header (see components/SiteHeader.tsx).
 *
 * Two shapes are needed. The normal icons use a rounded square. The maskable
 * one is used by Android, which crops the icon into the launcher's own shape,
 * so its background goes edge to edge and the letter is kept inside the middle
 * 80% where it cannot be clipped away.
 *
 * The iOS icon is a plain full square with no transparency, because iOS applies
 * its own rounded corners to it.
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const OUT_DIR = path.join(process.cwd(), "public", "icons");

/** The one violet the whole site uses - Tailwind's violet-600. */
const VIOLET = "#7c3aed";

/**
 * Builds one icon as an SVG, then returns it as a PNG buffer.
 *
 * @param size    width and height in pixels
 * @param radius  corner radius; 0 gives a full square
 * @param letter  font size of the "S" as a fraction of the icon
 */
function icon({ size, radius, letter }) {
  // The letter is centred, and nudged up very slightly because an "S" reads
  // low inside a box - this is the same optical fix a designer would make.
  const fontSize = Math.round(size * letter);
  const centre = size / 2 + size * 0.02;
  // `radius` arrives as a fraction of the icon, so scale it up to pixels.
  const corner = Math.round(size * radius);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${corner}" ry="${corner}" fill="${VIOLET}"/>
  <text x="50%" y="${centre}" dy="0.35em" text-anchor="middle"
        font-family="Helvetica, Arial, sans-serif" font-size="${fontSize}"
        font-weight="bold" fill="#ffffff">S</text>
</svg>`;

  return sharp(Buffer.from(svg)).png().toBuffer();
}

const icons = [
  { name: "icon-192.png", size: 192, radius: 0.22, letter: 0.56 },
  { name: "icon-512.png", size: 512, radius: 0.22, letter: 0.56 },
  // Smaller letter and no rounding: Android masks this one itself.
  { name: "maskable-512.png", size: 512, radius: 0, letter: 0.4 },
  { name: "apple-touch-icon.png", size: 180, radius: 0, letter: 0.56 },
];

await mkdir(OUT_DIR, { recursive: true });

for (const spec of icons) {
  const buffer = await icon(spec);
  await sharp(buffer).toFile(path.join(OUT_DIR, spec.name));
  console.log(`${spec.name} (${spec.size}x${spec.size}, ${buffer.length} bytes)`);
}

console.log(`\nwrote ${icons.length} icons to public/icons`);