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

function svgFor(label) {
  const safe = label
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Colours follow DESIGN.md: slate-100 background, slate-900 text, indigo-600 accent.
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <rect width="${SIZE}" height="${SIZE}" fill="#f8fafc"/>
  <circle cx="300" cy="260" r="120" fill="#e2e8f0"/>
  <circle cx="300" cy="260" r="120" fill="none" stroke="#4f46e5" stroke-width="4"/>
  <text x="300" y="470" font-family="Helvetica, Arial, sans-serif" font-size="30"
        font-weight="bold" fill="#0f172a" text-anchor="middle">${safe}</text>
  <rect x="0" y="${SIZE - 10}" width="${SIZE}" height="10" fill="#4f46e5"/>
</svg>`;
}

const outDir = path.join(process.cwd(), "public", "products");
await mkdir(outDir, { recursive: true });

for (const { slug, label } of products) {
  const file = path.join(outDir, `${slug}.png`);
  await sharp(Buffer.from(svgFor(label))).png().toFile(file);
  console.log("wrote", path.relative(process.cwd(), file));
}
