import type { JSX } from "react";
import { formatCost } from "@/lib/money";
import type { Stop, Reviews, Trail, PlaceOption, DataSource } from "@/lib/types";

/* ----------------------------------------------------------------- cost -- */

/**
 * `0` is Free. `null` is a phone call, never a guess and never "$0".
 * Four stops in the file are null and they must look different from free ones.
 */
export function CostLine({ stop }: { stop: Stop }): JSX.Element {
  const c = formatCost(stop.cost);
  return (
    <div className="fact">
      <dt>Cost</dt>
      <dd>
        <span className={`cost cost--${c.kind}`}>{c.label}</span>
        {c.per && <span className="fact__qual"> {c.per}</span>}
        {c.estimated && <span className="badge badge--estimate">estimate</span>}
      </dd>
      {c.note && <p className="fact__note">{c.note}</p>}
      {c.estimate && <p className="fact__note">{c.estimate}</p>}
    </div>
  );
}

/* ------------------------------------------------------------ practical -- */

const minutes = (m: number): string => {
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r === 0 ? `${h} hr` : `${h} hr ${r} min`;
};

/** Hours, season, phone, address — whichever of them this stop actually has. */
export function PracticalRow({ stop }: { stop: Stop }): JSX.Element {
  return (
    <dl className="facts">
      <CostLine stop={stop} />

      <div className="fact">
        <dt>Time there</dt>
        <dd>{minutes(stop.duration_min)}</dd>
      </div>

      {stop.hours && <div className="fact"><dt>Hours</dt><dd>{stop.hours}</dd></div>}
      {stop.schedule && <div className="fact"><dt>Schedule</dt><dd>{stop.schedule}</dd></div>}
      {stop.difficulty && <div className="fact"><dt>Difficulty</dt><dd>{stop.difficulty}</dd></div>}

      {stop.address && (
        <div className="fact">
          <dt>Where</dt>
          <dd>
            {stop.maps_query
              ? <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stop.maps_query)}`}
                  target="_blank" rel="noreferrer noopener">{stop.address}</a>
              : stop.address}
          </dd>
        </div>
      )}

      {stop.phone && (
        <div className="fact">
          <dt>Phone</dt>
          <dd><a href={`tel:${stop.phone.replace(/[^+\d]/g, "")}`}>{stop.phone}</a></dd>
        </div>
      )}

      {stop.tags.length > 0 && (
        <div className="fact fact--wide">
          <dt>Tags</dt>
          <dd className="tags">
            {stop.tags.map((t) => <span key={t} className="tag">{t}</span>)}
          </dd>
        </div>
      )}
    </dl>
  );
}

/* ----------------------------------------------------------------- flags -- */

/**
 * The honest keys, rendered rather than suppressed.
 *
 * Severity is not a style choice: `closed_since_v1` and `removed` mean the place
 * is gone and the plan is wrong, which is a different thing from a caveat about
 * parking. A season end sits between the two — the trip still works, but only on
 * a particular date.
 */
export function FlagBlock({ stop, booking }: { stop: Stop; booking?: number }): JSX.Element | null {
  const flags: { tone: "danger" | "warn" | "book"; mark: string; head: string; body?: string }[] = [];

  if (stop.closed_since_v1) {
    flags.push({ tone: "danger", mark: "✕", head: "Permanently closed.", body: stop.closed_since_v1 });
  }
  if (stop.removed) {
    flags.push({ tone: "danger", mark: "✕", head: "Dropped from the plan.", body: stop.removed });
  }
  if (stop.correction) {
    flags.push({ tone: "warn", mark: "!", head: "I had this wrong first time.", body: stop.correction });
  }
  if (stop.season) {
    flags.push({ tone: "warn", mark: "!", head: stop.season });
  }
  if (stop.caveat) {
    flags.push({ tone: "warn", mark: "!", head: stop.caveat });
  }
  if (stop.status === "unverified") {
    flags.push({
      tone: "warn", mark: "?", head: "Not verified.",
      body: "This one came from research I could not confirm against a live source.",
    });
  }
  if (stop.booking) {
    flags.push({
      tone: "book",
      mark: booking ? String(booking) : "•",
      head: booking === 1 ? "Book this first — before the room." : "Needs booking.",
      body: stop.booking,
    });
  }

  if (flags.length === 0) return null;

  return (
    <div className="flags">
      {flags.map((f, i) => (
        <div key={i} className={`flag flag--${f.tone}`}>
          <span className="flag__mark" aria-hidden="true">{f.mark}</span>
          <span><strong>{f.head}</strong>{f.body && <> {f.body}</>}</span>
        </div>
      ))}
    </div>
  );
}

/* --------------------------------------------------------------- reviews -- */

/**
 * Complaints are shown beside praise, at the same weight.
 *
 * A review block that printed only the good parts would be an advertisement,
 * and the entire point of the file is that she can trust what it says.
 */
export function ReviewBlock({ reviews }: { reviews: Reviews }): JSX.Element {
  const full = Math.round(reviews.rating);
  return (
    <section className="reviews">
      <header className="reviews__head">
        <span className="reviews__score" aria-label={`${reviews.rating} out of 5`}>
          {reviews.rating.toFixed(1)}
        </span>
        <span className="reviews__stars" aria-hidden="true">
          {"★".repeat(full)}<span className="dim">{"★".repeat(5 - full)}</span>
        </span>
        <span className="reviews__count">
          {reviews.count.toLocaleString("en-CA")} reviews · {reviews.source}
        </span>
      </header>

      {(reviews.praise?.length || reviews.complaints?.length) && (
        <div className="reviews__cols">
          {reviews.praise && reviews.praise.length > 0 && (
            <div>
              <h4 className="reviews__label reviews__label--good">What people like</h4>
              <ul>{reviews.praise.map((p) => <li key={p}>{p}</li>)}</ul>
            </div>
          )}
          {reviews.complaints && reviews.complaints.length > 0 && (
            <div>
              <h4 className="reviews__label reviews__label--bad">What they complain about</h4>
              <ul>{reviews.complaints.map((c) => <li key={c}>{c}</li>)}</ul>
            </div>
          )}
        </div>
      )}

      {reviews.note && <p className="reviews__note">{reviews.note}</p>}
      {reviews.warning && (
        <p className="reviews__note reviews__note--warn">{reviews.warning}</p>
      )}
    </section>
  );
}

/* ----------------------------------------------------------------- trail -- */

export function TrailStats({ trails }: { trails: Trail[] }): JSX.Element {
  return (
    <section className="trails">
      {trails.map((t, i) => (
        <article key={t.url || i} className="trail">
          {t.name && <h4 className="trail__name">{t.name}</h4>}
          <dl className="trail__stats">
            <div><dt>Length</dt><dd>{t.length_km} km</dd></div>
            <div><dt>Time</dt><dd>{t.average_time ?? minutes(t.duration_min)}</dd></div>
            <div><dt>Difficulty</dt><dd>{t.difficulty}</dd></div>
            <div><dt>Shape</dt><dd>{t.route_type}</dd></div>
            {t.elevation_gain_m !== undefined && (
              <div><dt>Climb</dt><dd>{t.elevation_gain_m} m</dd></div>
            )}
            <div><dt>Rating</dt><dd>{t.rating.toFixed(1)} ★</dd></div>
          </dl>
          {t.note && <p className="trail__note">{t.note}</p>}
          {t.url && (
            <a className="trail__link" href={t.url} target="_blank" rel="noreferrer noopener">
              AllTrails
            </a>
          )}
        </article>
      ))}
    </section>
  );
}

/* --------------------------------------------------------------- options -- */

/** Several venues to choose between, or things nearby if this one disappoints. */
export function OptionList(
  { title, options, recommended }:
  { title: string; options: PlaceOption[]; recommended?: string },
): JSX.Element {
  return (
    <section className="options">
      <h4 className="options__title">{title}</h4>
      <ul>
        {options.map((o) => {
          const pick = recommended && o.name === recommended;
          return (
            <li key={o.name} className={pick ? "option option--pick" : "option"}>
              <div className="option__head">
                <span className="option__name">{o.name}</span>
                {pick && <span className="badge badge--pick">his pick</span>}
                {o.rating !== undefined && (
                  <span className="option__rating">
                    {o.rating.toFixed(1)} ★{o.count !== undefined && ` · ${o.count}`}
                  </span>
                )}
              </div>
              {o.address && <p className="option__addr">{o.address}</p>}
              {o.note && <p className="option__note">{o.note}</p>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ---------------------------------------------------------------- source -- */

/** Where the number came from, and when it was last true. */
export function SourceBadge({ source }: { source: DataSource }): JSX.Element {
  const what = source.source ?? source.lodging ?? source.colour ?? "checked";
  return (
    <p className="source">
      <span className="source__dot" aria-hidden="true" />
      {what} · checked {source.checked}
    </p>
  );
}

/* ------------------------------------------------------------------ tips -- */

export function TipsBlock({ tips }: { tips: string[] }): JSX.Element {
  return (
    <section className="tips">
      <h4 className="tips__title">Worth knowing</h4>
      <ul>{tips.map((t) => <li key={t}>{t}</li>)}</ul>
    </section>
  );
}
