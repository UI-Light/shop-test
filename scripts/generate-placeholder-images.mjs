// Creates the placeholder product images used by the seed data in
// supabase/schema.sql. Run it from the project root with:
//
//   node scripts/generate-placeholder-images.mjs
//
// Replace the files in public/products/ with real product photos whenever
// you are ready - keep the same file names so the database keeps working.
import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SIZE = 600;

// slug -> the label drawn on the image (must match image_url in schema.sql)
const products = [
  { slug: "tshirt", label: "Everyday Cotton T-Shirt" },
  { slug: "mug", label: "Ceramic Mug" },
  { slug: "tote", label: "Linen Tote Bag" },
  { slug: "bottle", label: "Stainless Water Bottle" },
  { slug: "beanie", label: "Wool Beanie" },
  { slug: "notebook", label: "Leather Notebook" },
  { slug: "desk", label: "Bamboo Desk Organiser" },
  { slug: "pins", label: "Enamel Pin Set" },
  { slug: "apron", label: "Canvas Apron" },
];

/**
 * A simple line drawing of each product, drawn in a 0-100 coordinate box.
 * Colours follow DESIGN.md: slate-200 background, white shapes, indigo-600
 * outlines, slate-400 detail lines.
 */
const ART = {
  tshirt: `<path d="M38 16 L22 22 L10 38 L22 47 L27 41 L27 82 L73 82 L73 41 L78 47 L90 38 L78 22 L62 16 C58 24 42 24 38 16 Z" fill="#fff" stroke="#4f46e5" stroke-width="2" stroke-linejoin="round"/>`,
  mug: `<rect x="30" y="34" width="38" height="44" rx="3" fill="#fff" stroke="#4f46e5" stroke-width="2"/><path d="M68 44h6a9 9 0 0 1 0 18h-6" fill="none" stroke="#4f46e5" stroke-width="2"/><ellipse cx="49" cy="34" rx="19" ry="5" fill="#f8fafc" stroke="#4f46e5" stroke-width="2"/>`,
  tote: `<path d="M28 40h44l-5 42H33Z" fill="#fff" stroke="#4f46e5" stroke-width="2" stroke-linejoin="round"/><path d="M39 40V31a11 11 0 0 1 22 0v9" fill="none" stroke="#4f46e5" stroke-width="2"/>`,
  bottle: `<rect x="38" y="30" width="24" height="50" rx="8" fill="#fff" stroke="#4f46e5" stroke-width="2"/><rect x="42" y="14" width="16" height="14" rx="3" fill="#c7d2fe" stroke="#4f46e5" stroke-width="2"/><path d="M38 46h24" stroke="#94a3b8" stroke-width="2"/>`,
  beanie: `<path d="M25 60a25 25 0 0 1 50 0Z" fill="#fff" stroke="#4f46e5" stroke-width="2" stroke-linejoin="round"/><rect x="25" y="60" width="50" height="10" rx="3" fill="#e2e8f0" stroke="#4f46e5" stroke-width="2"/><circle cx="50" cy="33" r="5" fill="#4f46e5"/>`,
  notebook: `<rect x="28" y="20" width="44" height="56" rx="4" fill="#fff" stroke="#4f46e5" stroke-width="2"/><rect x="28" y="20" width="9" height="56" fill="#c7d2fe" stroke="#4f46e5" stroke-width="2"/><path d="M45 40h19M45 50h19M45 60h12" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>`,
  desk: `<rect x="20" y="58" width="60" height="22" rx="3" fill="#fff" stroke="#4f46e5" stroke-width="2"/><rect x="27" y="36" width="20" height="22" rx="3" fill="#e2e8f0" stroke="#4f46e5" stroke-width="2"/><rect x="53" y="44" width="20" height="14" rx="3" fill="#e2e8f0" stroke="#4f46e5" stroke-width="2"/>`,
  pins: `<circle cx="36" cy="46" r="13" fill="#fff" stroke="#4f46e5" stroke-width="2"/><circle cx="62" cy="38" r="10" fill="#c7d2fe" stroke="#4f46e5" stroke-width="2"/><circle cx="52" cy="66" r="11" fill="#fff" stroke="#4f46e5" stroke-width="2"/>`,
  apron: `<path d="M40 30h20a12 12 0 0 1 12 12v40H28V42a12 12 0 0 1 12-12Z" fill="#fff" stroke="#4f46e5" stroke-width="2" stroke-linejoin="round"/><path d="M45 30v-7a5 5 0 0 1 10 0v7" fill="none" stroke="#4f46e5" stroke-width="2"/><rect x="39" y="56" width="22" height="14" rx="2" fill="#e2e8f0" stroke="#4f46e5" stroke-width="2"/>`,
};

function svgFor(slug, label) {
  const safe = label
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const art = ART[slug] ?? "";

  // The product drawing is laid out in a 0-100 box, shrunk slightly and
  // nudged up so the product name fits underneath.
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#e2e8f0"/>
  <g transform="translate(50 45) scale(0.78) translate(-50 -50)">${art}</g>
  <text x="50" y="88" font-family="Helvetica, Arial, sans-serif" font-size="7"
        font-weight="bold" fill="#0f172a" text-anchor="middle">${safe}</text>
  <rect x="0" y="98.4" width="100" height="1.6" fill="#4f46e5"/>
</svg>`;
}

const outDir = path.join(process.cwd(), "public", "products");
await mkdir(outDir, { recursive: true });

for (const { slug, label } of products) {
  const file = path.join(outDir, `${slug}.png`);
  await sharp(Buffer.from(svgFor(slug, label))).png().toFile(file);
  console.log("wrote", path.relative(process.cwd(), file));
}
