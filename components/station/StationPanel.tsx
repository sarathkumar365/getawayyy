"use client";

import type { JSX } from "react";
import type { Station } from "@/lib/scene/itinerary";
import type { StopReaction } from "@/lib/answers";
import { photosForStop } from "@/lib/photos";
import { PhotoStrip } from "./PhotoStrip";
import {
  PracticalRow, FlagBlock, ReviewBlock, TrailStats, OptionList, SourceBadge, TipsBlock,
} from "./blocks";
import { ReactionRow } from "@/components/answers/ReactionRow";

export type StationPanelProps = {
  station: Station;
  /** 1 = book this first, from the trip's own bookings list. */
  bookingPriority?: number;
  reaction?: StopReaction;
  note?: string;
  onReact: (key: string, r: StopReaction) => void;
  onNote: (key: string, text: string) => void;
};

/**
 * What rises when she arrives somewhere.
 *
 * Order is deliberate and does not vary by station, so the shape is learnable:
 *
 *   when / what it is  ->  photos  ->  anything alarming  ->  the facts
 *   ->  the researched detail  ->  her say
 *
 * Photos come second because on 17 of the 37 stations they ARE the content.
 * Flags come before the facts because a closure or a correction changes whether
 * you go at all, and a thing that changes the decision cannot sit under a
 * price. Her row is always last and always identical.
 */
export function StationPanel({
  station, bookingPriority, reaction, note, onReact, onNote,
}: StationPanelProps): JSX.Element {
  const { stop } = station;
  const trails = stop.trail ? [stop.trail] : (stop.trail_options ?? []);

  return (
    <article className="panel" aria-labelledby={`${station.id}-title`}>
      <div className="panel__grip" aria-hidden="true" />

      <header className="panel__head">
        <p className="panel__meta">
          <span className="panel__when">{stop.time}</span>
          <span>{station.dayLabel}</span>
          <span className="panel__of">Stop {station.index}</span>
        </p>
        <h3 id={`${station.id}-title`} className="panel__title">{stop.name}</h3>
        {stop.description
          ? <p className="panel__desc">{stop.description}</p>
          : <p className="panel__desc panel__desc--none">
              No description for this one — so the photos are the description.
            </p>}
      </header>

      <PhotoStrip
        name={stop.name}
        local={photosForStop(stop.name)}
        query={stop.maps_query}
      />

      <FlagBlock stop={stop} booking={bookingPriority} />

      <PracticalRow stop={stop} />

      {stop.note && <p className="panel__note">{stop.note}</p>}
      {stop.tips && stop.tips.length > 0 && <TipsBlock tips={stop.tips} />}
      {stop.reviews && <ReviewBlock reviews={stop.reviews} />}
      {trails.length > 0 && <TrailStats trails={trails} />}

      {stop.options && stop.options.length > 0 && (
        <OptionList title="Choose one" options={stop.options} recommended={stop.recommended} />
      )}
      {stop.alternatives_nearby && stop.alternatives_nearby.length > 0 && (
        <OptionList title="Also nearby" options={stop.alternatives_nearby} />
      )}

      {stop.data_source && <SourceBadge source={stop.data_source} />}

      <ReactionRow
        stopKey={station.key}
        reaction={reaction}
        note={note}
        onReact={onReact}
        onNote={onNote}
      />
    </article>
  );
}
