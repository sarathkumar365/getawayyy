/**
 * How long each trip's walk is, and whether anything in it collides.
 *
 * Run after touching a script or the scenery: `bun run scripts/measure-walk.ts`.
 * A silent run, a camera that goes backwards, two cards up at once or a card
 * over an arrival line are all things the eye catches late and this catches
 * immediately.
 */
import { allTrips } from "@/lib/data";
import { itineraryFor } from "@/lib/scene/itinerary";
import { stageFor, hasScript } from "@/lib/scene/journeys";
import { buildSchedule, cameraAt } from "@/lib/scene/schedule";

let bad = 0;

for (const trip of allTrips) {
  if (!hasScript(trip.id)) continue;
  const itinerary = itineraryFor(trip);
  const stage = stageFor(trip.id, itinerary);
  const schedule = buildSchedule(itinerary, stage.legs, {
    pace: stage.pace, arrivals: stage.arrivals,
  });

  const lines = Object.values(stage.legs).reduce((n, l) => n + l.beats.length, 0);
  const props = Object.values(stage.legs).reduce((n, l) => n + l.items.length, 0);
  const kinds = new Set<string>();
  for (const l of Object.values(stage.legs)) for (const i of l.items) kinds.add(i.kind);

  const silent = Object.values(stage.legs).filter((l) => l.beats.length === 0).length;
  if (silent > 0) { console.log(`  ! ${trip.id}: ${silent} silent run(s)`); bad += 1; }

  let last = -Infinity;
  let backwards = 0;
  let twoCards = 0;
  for (let p = 0; p <= 1; p += 0.0004) {
    const at = cameraAt(schedule, p);
    if (at.z < last - 0.5) backwards += 1;
    last = at.z;
    const up = Object.values(at.rise).filter((v) => v > 0.01).length;
    if (up > 1) twoCards += 1;
  }
  if (backwards > 0) { console.log(`  ! ${trip.id}: camera went backwards ${backwards}x`); bad += 1; }
  if (twoCards > 0) { console.log(`  ! ${trip.id}: two cards up ${twoCards}x`); bad += 1; }

  console.log(
    `${trip.id.padEnd(22)} ${String(itinerary.stations.length).padStart(2)} stops  ` +
    `${String(lines).padStart(3)} lines  ${schedule.screens.toFixed(1).padStart(5)} screens  ` +
    `${String(props).padStart(5)} props  ${kinds.size} kinds`,
  );
}

console.log(bad === 0 ? "\nall clear" : `\n${bad} problem(s)`);
if (bad > 0) process.exit(1);
