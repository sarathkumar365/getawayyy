/**
 * Which stops does Google already have photos for, and which need our own?
 *
 * Results are cached to data/photo-audit.json and never re-fetched, so this
 * costs one Text Search per unique maps_query, once. Re-run it and it is free.
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { searchPlace, hasKey } from "../lib/places";
import { featuredTrips, allStops } from "../lib/data";

const OUT = join(process.cwd(), "data", "photo-audit.json");

type Row = { count: number; place: string | null; checked: string };
const cache: Record<string, Row> = existsSync(OUT)
  ? (JSON.parse(readFileSync(OUT, "utf-8")) as { queries: Record<string, Row> }).queries
  : {};

if (!hasKey()) { console.error("GOOGLE_PLACES_API_KEY not set"); process.exit(1); }

type Target = { trip: string; name: string; q: string };
const targets: Target[] = [];
for (const t of featuredTrips) {
  for (const s of allStops(t)) {
    if (s.maps_query) targets.push({ trip: t.id, name: s.name, q: s.maps_query });
  }
}

const unique = [...new Set(targets.map((t) => t.q))];
let fetched = 0;

for (const q of unique) {
  if (cache[q]) continue;
  try {
    const place = await searchPlace(q, ["displayName", "photos"]);
    cache[q] = {
      count: place?.photos?.length ?? 0,
      place: place?.displayName?.text ?? null,
      checked: new Date().toISOString(),
    };
    fetched += 1;
  } catch (err) {
    console.error(`  ! ${q}: ${String(err).slice(0, 80)}`);
    cache[q] = { count: -1, place: null, checked: new Date().toISOString() };
  }
  await new Promise((r) => setTimeout(r, 90));
}

mkdirSync(join(process.cwd(), "data"), { recursive: true });
writeFileSync(OUT, `${JSON.stringify({ generated: new Date().toISOString(), queries: cache }, null, 2)}\n`);

const rows = targets.map((t) => ({ ...t, ...(cache[t.q] ?? { count: -1, place: null }) }));
const bare = rows.filter((r) => r.count === 0);
const thin = rows.filter((r) => r.count > 0 && r.count < 4);
const rich = rows.filter((r) => r.count >= 4);

console.log(`\nfetched ${fetched} new of ${unique.length} unique queries\n`);
console.log(`  rich (4+ Google photos)   ${rich.length}`);
console.log(`  thin (1-3)                ${thin.length}`);
console.log(`  NONE — needs your camera  ${bare.length}\n`);
console.log("STOPS WITH NO GOOGLE PHOTOS:");
for (const r of bare) console.log(`  [${r.trip}] ${r.name}`);
if (thin.length > 0) {
  console.log("\nTHIN (1-3 photos) — worth shooting too:");
  for (const r of thin) console.log(`  [${r.trip}] ${r.name}  (${r.count})`);
}
