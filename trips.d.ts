// Types for trips.json (schema 2.0.0)
// Every field marked `| null` is always PRESENT as a key, but may be null.

export interface TripsFile {
  $schema_version: string;
  meta: Meta;
  trips: Trip[];
  shared: Shared;
  research_notes: ResearchNotes;
  sources: Source[];
}

export interface Meta {
  title: string;
  subtitle: string;
  generated: string;            // ISO date
  currency: "CAD";
  origin: { city: string; province: string; maps_query: string };
  travellers: { count: number; type: string };
  all_prices_are_for: string;
  notes: string[];
  revision_note: string;
}

export type Direction = "North" | "North-west" | "East" | "Far east";

export interface Trip {
  id: string;
  slug: string;
  featured: boolean;            // filter on this; kingston-pec is the only false
  order: number;
  name: string;
  tagline: string;
  direction: Direction;
  bearing_deg: number;          // for a compass/radial layout
  status: "planned" | "superseded";
  summary: string;
  stats: TripStats;
  highlights: string[];
  scores: Scores;               // 0-5, my judgement, not sourced data
  budget: Budget;
  days: Day[];
  bookings: Booking[];
  warnings?: string[];
  alternatives?: Alternative[];

  // present on all except kingston-pec
  why_this_trip?: string;
  dates?: Dates;
  lodging?: Lodging;

  // trip-specific
  alternative_to?: string;      // muskoka <-> algonquin-haliburton
  how_it_differs_from_muskoka?: string[];
  the_honest_problem?: HonestProblem;   // quebec-city only
  food_notes?: Record<string, string[]>;
  links?: { label: string; url: string }[];
  superseded_by?: string;
  superseded_note?: string;
}

export interface TripStats {
  distance_km: number;
  drive_time_hours: number;
  nights: number;
  shape: string;
  one_way_km?: number;
  one_way_hours?: number;
  best_season?: string;
  base_town?: string;
  tolls?: string;
}

export interface Scores {
  nature: number; architecture_history: number; pottery: number;
  korean_anime: number; famous_landmark: number; photo_spots: number;
  relaxation: number; value: number;
}

export interface Dates {
  recommended: string;          // "2026-10-09 to 2026-10-11"
  label: string;
  why: string[];
  depart?: string;
  return?: string;
  note?: string;
  warning?: string;
  collision?: string;           // quebec-city clashes with georgian-bay
  data_source?: DataSource;
}

export interface Budget {
  currency: "CAD";
  for: string;
  total: number | null;         // null when the trip only has a range
  total_range: string | null;   // e.g. "1150-1350"
  default_variant: string;      // id of the variant `total`/`line_items` mirror
  line_items: LineItem[];
  variants: BudgetVariant[];
  note: string | null;
}

export interface BudgetVariant {
  id: string;
  label: string;
  total: number | null;
  total_range?: string;
  line_items: LineItem[] | null;
  note: string | null;
}

export interface LineItem {
  label: string;
  amount: number | string;      // string only where it is a range
  note?: string;
  optional?: boolean;
  estimated?: boolean;          // true = my guess, not verified
  was_estimated?: number;       // the v1.0 estimate, where live data replaced it
  data_source?: string;
}

export interface Day {
  day: number;                  // 0 = Friday evening travel
  label: string;
  stops: Stop[];
}

/** Guaranteed keys. Everything below `address` is optional. */
export interface Stop {
  time: string;                 // "09:30"
  name: string;
  type: StopType;
  description: string | null;
  duration_min: number;
  cost: Cost;
  maps_query: string | null;    // feed to Maps; no lat/lng in this file
  tags: string[];
  address: string | null;

  phone?: string;
  hours?: string;
  season?: string;
  booking?: string;
  transit?: string;
  note?: string;
  tips?: string[];
  caveat?: string;
  optional?: boolean;
  status?: "operational" | "unverified";
  difficulty?: string;
  reviews?: Reviews;
  trail?: Trail;
  trail_options?: Trail[];
  options?: PlaceOption[];      // a stop with several venues to choose between
  recommended?: string;
  alternatives_nearby?: PlaceOption[];
  schedule?: string;
  data_source?: DataSource;
  correction?: string;          // where v1.0 was wrong (Old Baldy)
  closed_since_v1?: string;     // venue permanently closed (O-Taku)
  removed?: string;             // venue dropped (Georgian Bay Pottery)
}

export type StopType =
  | "drive" | "travel" | "food" | "nature" | "history" | "art" | "market"
  | "landmark" | "architecture" | "viewpoint" | "workshop" | "attraction"
  | "town" | "culture" | "sight" | "drive-and-explore";

export interface Cost {
  amount: number | null;        // 0 = free, null = unknown / needs a call
  per: string;                  // "two" | "person" | "vehicle"
  note: string | null;
  estimate?: string;
  estimated?: boolean;
}

export interface Reviews {
  source: "Google Places" | "TripAdvisor" | "AllTrails";
  rating: number;
  count: number;
  praise?: string[];
  complaints?: string[];
  note?: string;
  warning?: string;
}

export interface Trail {
  name?: string;
  /* Optional because the research is honest about its gaps: the Old Baldy entry
     has no difficulty and no duration_min, only an average_time string. Typing
     them as required made the renderer print labels over empty values. */
  length_km?: number;
  duration_min?: number;
  difficulty?: string;
  route_type?: string;
  rating?: number;
  elevation_gain_m?: number;
  elevation_max_m?: number;
  average_time?: string;
  reviews_count?: number;
  photos_count?: number;
  note?: string;
  url: string;
}

export interface PlaceOption {
  name: string;
  address?: string;
  rating?: number;
  count?: number;
  note?: string;
}

export interface Lodging {
  searched_for: string;
  prices_are: string;
  options: LodgingOption[];
  recommended: string;
  finding?: string;
  surprise?: string;
  caveat?: string;
  data_source: DataSource;
}

export interface LodgingOption {
  name: string;
  total: number;                // whole stay, two people
  per_night?: number;
  score: number | null;         // null = unrated, not badly rated
  reviews?: number;
  stars?: number;
  address: string;
  town?: string;
  district?: string;
  pick?: string;                // "cheapest" | "best value" | "best reviewed" | ...
  note?: string;
  url: string;
}

export interface HonestProblem {
  headline: string;
  detail: string;
  options: { mode: string; duration: string; cost_note: string; verdict: string }[];
  recommendation: string;
}

export interface Booking {
  priority: number;             // 1 = book this first
  name: string;
  note?: string;
  phone?: string;
  url?: string;
  optional?: boolean;
}

export interface Alternative {
  name: string;
  note?: string;
  description?: string;
  type?: "splurge" | "rejected" | "different-shape";
  reason?: string;
  replaces?: string;
  cost?: { amount: number; range?: string; note?: string };
  reviews?: Reviews;
  recommendation?: string;
  url?: string;
  maps_query?: string;
}

export interface Shared {
  rental_car: Record<string, unknown>;
  gas_assumptions: { consumption_l_per_100km: number; price_per_litre: number };
  traveller_interests: { key: keyof Scores | string; label: string; weight: string }[];
  constraints: string[];
  open_questions: string[];
  date_plan: {
    constraint: string;
    one_weekend_each: Record<string, string>;
    collision: string;
    logic: string;
    hard_deadlines: string[];
  };
  [k: string]: unknown;         // what_changed_in_v1_1 / v1_2 / v2_0
}

export interface ResearchNotes {
  reviews_reachable: { source: string; status: string; note?: string }[];
  reviews_unreachable: { source: string; status: string; note?: string }[];
  suggested_connectors: { name: string; authless: boolean; tools: string[]; why?: string }[];
}

export interface Source { trip: string; label: string; url?: string; phone?: string }

export interface DataSource {
  source?: string;
  checked: string;
  trail_id?: number;
  colour?: string;
  lodging?: string;
}
