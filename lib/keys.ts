/**
 * The key a stop's answers are stored under.
 *
 * Deliberately NOT in `lib/answers.ts`: that file is "use client" for the hook,
 * and importing this from it made the whole itinerary derivation client-only —
 * which broke the moment a server component tried to derive a trip. A pure
 * string function has no business forcing that boundary.
 */
export const stopKey = (tripId: string, day: number, time: string | null): string =>
  `${tripId}:${day}:${time ?? "?"}`;
