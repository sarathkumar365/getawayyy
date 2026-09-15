import { NextResponse } from "next/server";

/**
 * GET /api/weather?lat=&lon=
 *
 * TYPICAL October conditions, not a forecast.
 *
 * The trips are in October 2026 and no forecast model reaches that far, so a
 * forecast endpoint would be dishonest as well as empty. This averages the last
 * five real Octobers from Open-Meteo's archive instead — actual measurements,
 * clearly labelled as a historical average.
 *
 * Open-Meteo needs no key. Coordinates come from the build-time geocoding pass.
 */
export const revalidate = 21600; // 6h — the underlying archive moves once a year

const ARCHIVE = "https://archive-api.open-meteo.com/v1/archive";

type Daily = {
  time: string[];
  temperature_2m_max: (number | null)[];
  temperature_2m_min: (number | null)[];
  precipitation_sum: (number | null)[];
};

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

export async function GET(request: Request) {
  const p = new URL(request.url).searchParams;
  const lat = Number(p.get("lat"));
  const lon = Number(p.get("lon"));

  if (!Number.isFinite(lat) || !Number.isFinite(lon) ||
      lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return NextResponse.json({ error: "bad lat/lon" }, { status: 400 });
  }

  // Five completed Octobers. Kept as whole months so the mean isn't skewed by
  // a partial window.
  const years = [2020, 2021, 2022, 2023, 2024];
  const url =
    `${ARCHIVE}?latitude=${lat}&longitude=${lon}` +
    `&start_date=${years[0]}-10-01&end_date=${years[years.length - 1]}-10-31` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum` +
    `&timezone=America%2FToronto`;

  try {
    const res = await fetch(url, { next: { revalidate: 21600 } });
    if (!res.ok) return NextResponse.json({ available: false }, { status: 502 });

    const json = (await res.json()) as { daily?: Daily };
    const d = json.daily;
    if (!d?.time?.length) return NextResponse.json({ available: false });

    // The range spans five full years; keep only the Octobers.
    const keep = d.time.map((t, i) => ({ t, i })).filter(({ t }) => t.slice(5, 7) === "10");
    const highs = keep.map(({ i }) => d.temperature_2m_max[i]).filter((v): v is number => v !== null);
    const lows = keep.map(({ i }) => d.temperature_2m_min[i]).filter((v): v is number => v !== null);
    const precip = keep.map(({ i }) => d.precipitation_sum[i]).filter((v): v is number => v !== null);

    const wetDays = precip.filter((mm) => mm >= 1).length;

    return NextResponse.json({
      available: true,
      kind: "historical-average",
      basis: `October ${years[0]}–${years[years.length - 1]}, Open-Meteo archive`,
      note: "Typical conditions, not a forecast — no model reaches October 2026.",
      highC: round(mean(highs)),
      lowC: round(mean(lows)),
      rainChance: precip.length ? Math.round((wetDays / precip.length) * 100) : null,
      sampleDays: precip.length,
    });
  } catch (err) {
    console.error("[/api/weather]", err);
    return NextResponse.json({ available: false, error: "lookup failed" }, { status: 502 });
  }
}

const round = (n: number | null) => (n === null ? null : Math.round(n * 10) / 10);
