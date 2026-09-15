import { allTrips, featuredTrips, groupedForListing, meta, stopCount } from "@/lib/data";
import { budgetHeadline } from "@/lib/money";
import { defaultWeights, rankTrips, UNSCOREABLE_INTERESTS } from "@/lib/match";

/**
 * PHASE 0 SCAFFOLD — not the design.
 *
 * This exists to prove the data layer end to end: the file loads, the types
 * hold, the selectors compute, and the paired north trips group correctly.
 * Screen 1 (Arrival) replaces this in Phase 4.
 */
export default function Page() {
  const ranked = rankTrips(featuredTrips, defaultWeights());
  const groups = groupedForListing();

  return (
    <main style={{ maxWidth: "var(--measure)", margin: "0 auto", padding: "var(--s-7) var(--s-5)" }}>
      <p style={{ font: "var(--step--1)/1.4 var(--font-mono)", color: "var(--ink-faint)", margin: 0 }}>
        phase 0 scaffold
      </p>
      <h1 style={{ fontSize: "var(--step-3)", margin: "var(--s-2) 0 var(--s-5)" }}>{meta.title}</h1>
      <p style={{ color: "var(--ink-soft)", marginTop: 0 }}>
        {allTrips.length} trips · {featuredTrips.length} featured ·{" "}
        {allTrips.reduce((n, t) => n + stopCount(t), 0)} stops
      </p>

      <h2 style={{ fontSize: "var(--step-1)", marginTop: "var(--s-7)" }}>Listing, grouped</h2>
      <ul style={{ paddingLeft: "var(--s-5)" }}>
        {groups.map((g) => {
          const isPair = Array.isArray(g);
          const items = isPair ? g : [g];
          return (
            <li key={items.map((t) => t.id).join("+")} style={{ marginBottom: "var(--s-3)" }}>
              {isPair && (
                <em style={{ color: "var(--ink-faint)" }}>
                  paired — two versions of the same north trip
                </em>
              )}
              <ul style={{ listStyle: isPair ? "circle" : "none", paddingLeft: isPair ? "var(--s-5)" : 0 }}>
                {items.map((t) => (
                  <li key={t.id} data-world={t.id}>
                    <strong style={{ color: "var(--w-accent)" }}>{t.name}</strong>{" "}
                    <span style={{ color: "var(--ink-faint)" }}>
                      {t.direction} · {stopCount(t)} stops · {budgetHeadline(t)}
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>

      <h2 style={{ fontSize: "var(--step-1)", marginTop: "var(--s-7)" }}>
        Ranked by the file&rsquo;s declared weights
      </h2>
      <p style={{ color: "var(--ink-faint)", fontSize: "var(--step--1)", marginTop: 0 }}>
        Subjective — <code>scores</code> is a judgement call, not sourced data.
      </p>
      <ol style={{ paddingLeft: "var(--s-5)" }}>
        {ranked.map((m) => (
          <li key={m.trip.id}>
            {m.trip.name} — {(m.score * 100).toFixed(0)}%{" "}
            <span style={{ color: "var(--ink-faint)", fontSize: "var(--step--1)" }}>
              ({m.topAxes.map((a) => a.label).join(", ")})
            </span>
          </li>
        ))}
      </ol>

      {UNSCOREABLE_INTERESTS.length > 0 && (
        <p style={{ background: "var(--warn-bg)", color: "var(--warn)", padding: "var(--s-4)",
                    borderRadius: "var(--radius)", fontSize: "var(--step--1)" }}>
          <strong>Data note:</strong> {UNSCOREABLE_INTERESTS.join(", ")} is a declared
          traveller interest with no matching score axis, so it cannot affect this
          ranking. The quiz has to handle it by hand.
        </p>
      )}
    </main>
  );
}
