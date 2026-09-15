/**
 * Scans public/photos/<slug>/ and writes data/photos.json.
 *
 * No image dimensions are extracted: the gallery uses fixed-aspect containers
 * with object-fit, so it never needs them and never shifts layout. That keeps
 * this script dependency-free.
 */
import { readdirSync, statSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const DIR = join(ROOT, "public", "photos");
const OUT = join(ROOT, "data", "photos.json");
const EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

const ext = (f: string): string => {
  const i = f.lastIndexOf(".");
  return i < 0 ? "" : f.slice(i).toLowerCase();
};

const stops: Record<string, string[]> = {};

if (existsSync(DIR)) {
  for (const slug of readdirSync(DIR)) {
    const dir = join(DIR, slug);
    if (!statSync(dir).isDirectory()) continue;
    const files = readdirSync(dir)
      .filter((f) => EXT.has(ext(f)))
      .sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
    if (files.length > 0) stops[slug] = files.map((f) => `/photos/${slug}/${f}`);
  }
}

mkdirSync(join(ROOT, "data"), { recursive: true });
writeFileSync(
  OUT,
  `${JSON.stringify({ generated: new Date().toISOString(), stops }, null, 2)}\n`,
  "utf-8",
);

const total = Object.values(stops).reduce((n, a) => n + a.length, 0);
console.log(`indexed ${total} photos across ${Object.keys(stops).length} stops -> data/photos.json`);
