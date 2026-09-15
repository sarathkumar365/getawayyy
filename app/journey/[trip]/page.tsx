import type { JSX } from "react";
import { JourneyView } from "./JourneyView";

/**
 * Server component on purpose: `useParams` is null during the server render of
 * a client page, which silently produced a "no trip" page for every URL. The
 * route param is the trip ID, matching /panel/[trip] — the slugs in the file
 * are a different, longer set and mixing the two is exactly how that bug
 * happened twice.
 */
export default async function JourneyPage(
  { params }: { params: Promise<{ trip: string }> },
): Promise<JSX.Element> {
  const { trip } = await params;
  return <JourneyView tripId={trip} />;
}
