import type { Cost, Budget, BudgetVariant, LineItem, Trip } from "./types";

/* ------------------------------------------------------------------ cost -- */

export type CostDisplay = {
  /** What to print. */
  label: string;
  /** Free / unknown / priced — for styling, not for copy. */
  kind: "free" | "unknown" | "priced";
  /** "for two", "per person", "per vehicle" — already humanised. */
  per: string | null;
  note: string | null;
  /** Only set when kind === "unknown" and the file offers a guess. */
  estimate: string | null;
  estimated: boolean;
};

const humanPer: Record<string, string> = {
  two: "for two",
  person: "per person",
  vehicle: "per vehicle",
};

/**
 * The single most important rule in the file:
 *   0    -> genuinely free
 *   null -> UNKNOWN, needs a phone call. Never "$0", never "Free".
 * Four stops are null: Blackbird Pottery, Hello Pottery Co., and Quebec City's
 * two travel legs (null because the travel mode isn't decided).
 */
export function formatCost(cost: Cost): CostDisplay {
  const per = cost.per ? (humanPer[cost.per] ?? cost.per) : null;
  const base = {
    per,
    note: cost.note ?? null,
    estimate: cost.estimate ?? null,
    estimated: cost.estimated === true,
  };

  if (cost.amount === null) return { ...base, label: "Call to confirm", kind: "unknown" };
  if (cost.amount === 0) return { ...base, label: "Free", kind: "free", per: null };
  return { ...base, label: money(cost.amount), kind: "priced" };
}

/** CAD, no cents unless the number actually has them. */
export function money(n: number): string {
  const hasCents = Math.round(n * 100) % 100 !== 0;
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  }).format(n);
}

/**
 * Line-item amounts are `number | string` — string only where the value is a
 * range. Never do arithmetic on one.
 */
export function formatAmount(amount: number | string): string {
  return typeof amount === "number" ? money(amount) : `$${amount}`;
}

/** "1150-1350" -> "$1,150–$1,350". Rendered as a range; never averaged. */
export function formatRange(range: string): string {
  const m = range.match(/^(\d+)\s*[-–]\s*(\d+)$/);
  if (!m) return `$${range}`;
  return `${money(Number(m[1]))}–${money(Number(m[2]))}`;
}

/* ---------------------------------------------------------------- budget -- */

export type ResolvedBudget = {
  variantId: string;
  label: string;
  /** Exactly one of these is set. */
  total: number | null;
  totalRange: string | null;
  /** Pretty, ready to print. */
  headline: string;
  /**
   * null when the variant only describes itself in prose — muskoka "trimmed"
   * and georgian-bay "lean" both do. Render `note`, not an empty table.
   */
  lineItems: LineItem[] | null;
  note: string | null;
  isDefault: boolean;
};

export function resolveBudget(trip: Trip, variantId?: string): ResolvedBudget {
  const b: Budget = trip.budget;
  const id = variantId ?? b.default_variant;
  const v: BudgetVariant | undefined = b.variants.find((x) => x.id === id);

  // The default variant's numbers are mirrored onto budget.total/line_items,
  // so fall back to those when the variant entry is thin or missing.
  const isDefault = id === b.default_variant;
  const total = v ? v.total : isDefault ? b.total : null;
  const totalRange = (v?.total_range ?? (isDefault ? b.total_range : null)) ?? null;
  const lineItems = v?.line_items ?? (isDefault ? b.line_items : null);

  return {
    variantId: id,
    label: v?.label ?? "Everything",
    total,
    totalRange,
    headline:
      total !== null ? money(total) : totalRange ? formatRange(totalRange) : "—",
    lineItems,
    note: v?.note ?? (isDefault ? b.note : null),
    isDefault,
  };
}

/** The headline number for a card. Reads total + total_range only. */
export function budgetHeadline(trip: Trip): string {
  const { total, total_range } = trip.budget;
  if (total !== null) return money(total);
  if (total_range) return formatRange(total_range);
  return "—";
}

/** Sort key for the ledger. Ranges sort by their low end. */
export function budgetSortValue(trip: Trip): number {
  if (trip.budget.total !== null) return trip.budget.total;
  const m = trip.budget.total_range?.match(/^(\d+)/);
  return m ? Number(m[1]) : Number.POSITIVE_INFINITY;
}
