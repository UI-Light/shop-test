#!/usr/bin/env node
/**
 * Fetches the nine product photographs from Wikimedia Commons.
 *
 *   node scripts/fetch-product-photos.mjs
 *
 * Each photo was chosen by eye from a Commons search and is listed in PICKS
 * by its exact file name, so re-running this always produces the same result.
 * The saved files are always public/products/<slug>.jpg - the same names the
 * database already points at, so there is no database change to make.
 * public/products/CREDITS.md is rewritten with the author and licence of each
 * photo, because CC BY-SA photos must be credited.
 *
 * Replace a photo by editing PICKS and running this again, or just drop your
 * own file in as public/products/<slug>.jpg.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SIZE = 800;
const OUT_DIR = path.join(process.cwd(), "public", "products");

// Wikimedia asks every client to identify itself: a tool name plus a URL that
// says who you are. Their robot policy rejects anything else (an email in
// particular), so keep this exact shape and swap in your own repository URL:
// https://foundation.wikimedia.org/wiki/Policy:Wikimedia_Foundation_User-Agent_Policy
const USER_AGENT = "ShopWebsiteDemo/1.0 (https://github.com/example/shop-website)";

/** File name in public/products -> the Commons file to use for it. */
const PICKS = {
  tshirt: "GlobeTeeFront-i0427clb.png",
  mug: "PlainMug.jpg",
  tote: "Canvas tote bag from Books & Books, Miami, Florida, USA - 20130912.jpg",
  bottle: "Polar Bottle® Half Twist™ Bottles.JPG",
  beanie: "Polo Cowichan Hat.jpg",
  notebook: "Legal pad and pencil.jpg",
  desk: "Skolni penal.jpg",
  pins: "Deep Space Semifinals Medal and Pins.jpg",
  apron: "Woodworking apron.webp",
};

/** Removes the HTML tags Commons puts inside its credit fields. */
function plainText(value) {
  return String(value ?? "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Looks one file up on Commons to get its download URL and licence. */
async function fileInfo(fileName) {
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("format", "json");
  url.searchParams.set("titles", `File:${fileName}`);
  url.searchParams.set("prop", "imageinfo");
  url.searchParams.set("iiprop", "url|extmetadata");
  url.searchParams.set("iiurlwidth", "1400");

  const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!response.ok) {
    throw new Error(`Commons said ${response.status}`);
  }

  const body = await response.json();
  const page = Object.values(body.query?.pages ?? {})[0];
  const info = page?.imageinfo?.[0];

  if (!info) {
    throw new Error(`no photo called "${fileName}" on Commons`);
  }

  return {
    thumbUrl: info.thumburl,
    originalUrl: info.url,
    source: info.descriptionurl,
    creator: plainText(info.extmetadata?.Artist?.value) || "unknown",
    licence: plainText(info.extmetadata?.LicenseShortName?.value) || "see source",
  };
}

/** Waits a moment - Commons asks for slow, polite request rates. */
function pause(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Downloads the photo, trying the scaled thumbnail first and falling back to
 * the full-size original. Wikimedia answers 403 when it thinks the requests
 * are too fast, so a couple of retries are built in.
 */
async function download(photo, fileName) {
  const urls = [photo.thumbUrl, photo.originalUrl].filter(Boolean);

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    for (const url of urls) {
      const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
      if (response.ok) {
        return Buffer.from(await response.arrayBuffer());
      }
      if (response.status !== 403 && response.status !== 429) {
        throw new Error(`downloading "${fileName}" said ${response.status}`);
      }
    }
    await pause(1500 * attempt);
  }

  throw new Error(`Commons kept saying 403 for "${fileName}"`);
}

await mkdir(OUT_DIR, { recursive: true });
const credits = [];

for (const [slug, fileName] of Object.entries(PICKS)) {
  try {
    const photo = await fileInfo(fileName);

    // rotate() applies the camera's EXIF orientation before we crop, then the
    // image is cropped square and saved under the name the database expects.
    await sharp(await download(photo, fileName))
      .rotate()
      .resize(SIZE, SIZE, { fit: "cover", position: "centre" })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(path.join(OUT_DIR, `${slug}.jpg`));

    credits.push({
      slug,
      title: fileName,
      creator: photo.creator,
      licence: photo.licence,
      source: photo.source,
    });

    console.log(`${slug}: ${fileName} - ${photo.creator} (${photo.licence})`);
  } catch (error) {
    console.log(`${slug}: ${error.message} - keeping the file that is already there`);
  }

  await pause(300);
}

const creditLines = [
  "# Product photo credits",
  "",
  "The product photos come from [Wikimedia Commons](https://commons.wikimedia.org).",
  "They stand in for real product photography. Swap in your own photos before",
  "selling anything - keep the file names (`tshirt.jpg`, `mug.jpg`, ...) the same",
  "and the database does not need to change.",
  "",
  "Generated by `node scripts/fetch-product-photos.mjs`.",
  "",
  ...credits.map(
    (credit) =>
      `- **${credit.slug}.jpg** - "${credit.title}" by ${credit.creator}, ` +
      `${credit.licence} - [source](${credit.source})`,
  ),
  "",
];

await writeFile(path.join(OUT_DIR, "CREDITS.md"), creditLines.join("\n"), "utf8");
console.log(`\nwrote public/products/CREDITS.md (${credits.length} photos)`);