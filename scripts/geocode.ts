/**
 * Build-time geocoding pass.
 *
 * trips.json deliberately carries no lat/lng — only `maps_query` strings.
 * This resolves them once, at build time, and caches the result to
 * data/coords.json. Nothing here runs at request time.
 *
 * Source: Open-Meteo geocoding. Free, keyless, no rate-limit exposure.
 *
 * Open-Meteo resolves PLACES (towns, parks), not street addresses or business
 * names. So we parse the town out of each maps_query and geocode that. Town-level
 * precision is exactly right for what we need it for:
 *   - weather is regional anyway
 *   - the compass / distance visuals work off trip-level bearings
 * Exact per-venue pins would need Google Geocoding; see TIER 2 below.
 *
 * Run: bun run geocode
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

/** Always run from the project root: `bun run geocode`. */
const ROOT = process.cwd();
const GEO = "https://geocoding-api.open-meteo.com/v1/search";

type Coord = {
  lat: number;
  lon: number;
  name: string;
  admin: string | null;
  /** true = this is a nearby stand-in, not the named place itself */
  approx?: true;
};

/**
 * Towns Open-Meteo can't resolve from the parsed string, or resolves wrongly.
 * Also catches the queries whose "town" slot holds a venue name, because the
 * string was "<Venue>, ON" with no town in it at all.
 */
const OVERRIDES: Record<string, string> = {
  // venue-shaped strings with no town component
  "Algonquin Logging Museum": "Algonquin Provincial Park",
  "Algonquin Provincial Park West Gate": "Algonquin Provincial Park",
  "Algonquin Visitor Centre": "Algonquin Provincial Park",
  "Algonquin Park": "Algonquin Provincial Park",
  "Eugenia Falls Conservation Area": "Eugenia",
  "Lake on the Mountain Provincial Park": "Picton",
  // hamlets Open-Meteo has no record of -> nearest settlement it does carry.
  // No coordinate here is hand-entered; these stay honest by resolving a real
  // nearby place and flagging the substitution in the output.
  Kimberley: "Eugenia",                  // ~8 km; Old Baldy sits between them
  "Ile d'Orleans": "Québec",             // ~15 km; the data itself calls it "15 minutes from the city"
  // district / informal names
  "Old Quebec": "Québec",
  "Quebec City": "Québec",
  "Quebec": "Québec",
  "Old Montreal": "Montreal",
  "Old Port of Montreal": "Montreal",
  "Blue Mountains": "Thornbury",         // the town inside the municipality
  "Lake of Bays": "Dorset",
  "Prince Edward County": "Picton",
};

/** Overrides that stand in for a DIFFERENT place, not just a renaming of it. */
const APPROXIMATE = new Set([
  "Algonquin Logging Museum",
  "Algonquin Provincial Park West Gate",
  "Algonquin Visitor Centre",
  "Algonquin Park",
  "Eugenia Falls Conservation Area",
  "Lake on the Mountain Provincial Park",
  "Kimberley",
  "Ile d'Orleans",
  "Blue Mountains",
  "Lake of Bays",
  "Prince Edward County",
]);

/** Which province each override/town must land in, when the query doesn't say. */
const PROVINCE_HINT: Record<string, "ON" | "QC"> = {
  "Québec": "QC",
  "Saint-Laurent-de-l'Île-d'Orléans": "QC",
  Montreal: "QC",
};

/** Pull the town out of a maps_query. */
function townOf(query: string): string | null {
  // Route strings: "Collingwood, ON to Toronto, ON" — take the origin.
  const route = query.split(/\s+to\s+/i);
  const head = route[0] ?? query;

  const parts = head.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return null;

  const isProvince = (s: string) => /^(ON|QC|Ontario|Quebec|Qu[ée]bec)$/i.test(s);

  // Last segment is often "<Town> <PROV>" or bare "<PROV>".
  let last = parts[parts.length - 1]!;
  let town: string;

  if (isProvince(last)) {
    town = parts.length >= 2 ? parts[parts.length - 2]! : last;
  } else {
    town = last.replace(/\s+(ON|QC)$/i, "").trim();
  }

  // Drop street-address noise: "3623 Rue Saint-Denis", "Rue Saint-Jean".
  if (/^\d/.test(town) || /^(Rue|Street|St\.?|Avenue|Ave)\b/i.test(town)) {
    town = parts.length >= 3 ? parts[parts.length - 3]!.replace(/\s+(ON|QC)$/i, "").trim() : town;
  }

  // "Downtown Kingston" -> "Kingston"
  town = town.replace(/^Downtown\s+/i, "").trim();

  return town || null;
}

const ADMIN_RE = { ON: /^ontario$/i, QC: /^(qu[ée]bec)$/i };

/**
 * Province filtering is not optional here. Canada reuses town names heavily —
 * an unfiltered lookup puts Haliburton in Nova Scotia, Kimberley in British
 * Columbia and Whitney in New Brunswick. All three are wrong by 1,000+ km.
 */
async function geocode(town: string, province: "ON" | "QC"): Promise<Coord | null> {
  const q = OVERRIDES[town] ?? town;
  const want = PROVINCE_HINT[q] ?? province;
  const url = `${GEO}?name=${encodeURIComponent(q)}&count=10&language=en&format=json&countryCode=CA`;
  const res = await fetch(url);
  if (!res.ok) {
    console.warn(`  ! HTTP ${res.status} for "${q}"`);
    return null;
  }
  const json = (await res.json()) as {
    results?: { latitude: number; longitude: number; name: string; admin1?: string; country_code?: string }[];
  };
  const canadian = (json.results ?? []).filter((r) => r.country_code === "CA");
  const inProvince = canadian.find((r) => r.admin1 && ADMIN_RE[want].test(r.admin1));
  const hit = inProvince ?? null;
  if (!hit) {
    if (canadian.length) {
      console.warn(`  ! "${q}" found in Canada but not in ${want} (saw: ${canadian.map((c) => c.admin1).join(", ")})`);
    }
    return null;
  }
  const coord: Coord = { lat: hit.latitude, lon: hit.longitude, name: hit.name, admin: hit.admin1 ?? null };
  if (APPROXIMATE.has(town)) coord.approx = true;
  return coord;
}

async function main() {
  const trips = JSON.parse(readFileSync(resolve(ROOT, "trips.json"), "utf8")) as {
    meta: { origin: { maps_query: string } };
    trips: { id: string; days: { stops: { maps_query: string | null }[] }[] }[];
  };

  // Collect every query, and map query -> town.
  const queries = new Set<string>([trips.meta.origin.maps_query]);
  for (const t of trips.trips)
    for (const d of t.days)
      for (const s of d.stops) if (s.maps_query) queries.add(s.maps_query);

  const queryToTown = new Map<string, string>();
  const townProvince = new Map<string, "ON" | "QC">();
  for (const q of queries) {
    const town = townOf(q);
    if (!town) { console.warn(`  ? no town parsed from "${q}"`); continue; }
    queryToTown.set(q, town);
    // The province is stated in the query itself; default ON (origin is Toronto).
    const prov = /\bQC\b|Qu[ée]bec/i.test(q.split(/\s+to\s+/i)[0] ?? q) ? "QC" : "ON";
    if (!townProvince.has(town)) townProvince.set(town, prov);
  }
  const towns = new Set(queryToTown.values());

  console.log(`${queries.size} queries -> ${towns.size} distinct towns`);

  const coords: Record<string, Coord> = {};
  const failed: string[] = [];
  for (const town of [...towns].sort()) {
    const c = await geocode(town, townProvince.get(town) ?? "ON");
    if (c) {
      coords[town] = c;
      const via = OVERRIDES[town] ? ` ${c.approx ? "~" : "="} "${OVERRIDES[town]}"` : "";
      console.log(`  ok  ${town.padEnd(36)} ${c.lat.toFixed(4)}, ${c.lon.toFixed(4)}  ${c.name}, ${c.admin}${via}`);
    } else {
      failed.push(town);
      console.log(`  --  ${town.padEnd(36)} UNRESOLVED`);
    }
    await new Promise((r) => setTimeout(r, 120)); // be polite
  }

  const out = {
    generated: new Date().toISOString(),
    source: "Open-Meteo geocoding (keyless)",
    precision: "town-level; venue pins would need Google Geocoding (TIER 2)",
    note: "Every coordinate here came from Open-Meteo. None is hand-entered. Entries flagged approx:true resolved a nearby settlement instead of the named place, because Open-Meteo carries no record of it.",
    towns: coords,
    queryToTown: Object.fromEntries(queryToTown),
    unresolved: failed,
  };

  mkdirSync(resolve(ROOT, "data"), { recursive: true });
  writeFileSync(resolve(ROOT, "data/coords.json"), JSON.stringify(out, null, 2));
  console.log(`\nwrote data/coords.json — ${Object.keys(coords).length} towns, ${failed.length} unresolved`);
  if (failed.length) console.log(`unresolved: ${failed.join(", ")}`);
}

main();
