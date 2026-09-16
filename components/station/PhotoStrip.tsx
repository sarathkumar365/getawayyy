"use client";

import Image from "next/image";
import { useCallback, useRef, useState, type JSX } from "react";
import { usePhotos, useEscape, apiSrc } from "@/components/media/usePhotos";

export type PhotoStripProps = {
  name: string;
  /** Photos shipped in /public — his own, and always preferred. */
  local: readonly string[];
  /** `maps_query`. Without one there is nothing to look up. */
  query: string | null;
  /**
   * Whether this station is the one she is at. Every panel in a trip is mounted
   * at once, so fetching on mount meant eight Places lookups and up to eighty
   * image requests fired the moment the page opened — which locked up a phone
   * before she could touch anything.
   */
  active?: boolean;
};

/**
 * The gallery on a station panel.
 *
 * A horizontal swipe strip rather than the grid used elsewhere, because on a
 * thin station this IS the content: 17 of the 37 stations carry nothing but a
 * name, a time and one sentence. A grid of two thumbnails under a single line
 * of text reads as a page that failed to load; a strip you push through reads
 * as somewhere worth going.
 */
export function PhotoStrip({ name, local, query, active = false }: PhotoStripProps): JSX.Element {
  const { extra } = usePhotos(query, name, active);
  const [open, setOpen] = useState<string | null>(null);
  const close = useCallback(() => setOpen(null), []);
  useEscape(open, close);

  const api = extra.state === "ok" ? extra.photos : [];
  const count = local.length + api.length;

  const rail = useRef<HTMLUListElement>(null);
  /** Page by a whole photo. Arrows exist because a swipe is not guaranteed —
   *  a drag that starts on an image or a button is easy for a browser to claim
   *  as something else, and then the gallery looks like it has one photo. */
  const page = useCallback((dir: -1 | 1) => {
    const el = rail.current;
    if (!el) return;
    const cell = el.querySelector<HTMLElement>(".strip__cell");
    const step = cell ? cell.getBoundingClientRect().width + 8 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }, []);

  if (count === 0) {
    return (
      <div className="strip__empty">
        {!active ? (
          <span>photos load as you arrive</span>
        ) : extra.state === "loading" ? (
          <span>looking for photos…</span>
        ) : extra.state === "none" && extra.why === "no-key" ? (
          <span>Photos need the Places key. The trip itself is unaffected.</span>
        ) : (
          <span>No photos for this one yet.</span>
        )}
      </div>
    );
  }

  return (
    <>
      <ul className="strip" ref={rail} aria-label={`Photos of ${name}`}>
        {local.map((src, i) => (
          <li key={src} className="strip__cell">
            <button type="button" onClick={() => setOpen(src)} aria-label={`${name}, photo ${i + 1}`}>
              <Image src={src} alt={`${name} — photo ${i + 1}`} fill draggable={false}
                sizes="(max-width: 700px) 80vw, 420px"
                style={{ objectFit: "cover" }} priority={active && i === 0} />
            </button>
          </li>
        ))}

        {api.map((p) => {
          const credit = p.attribution[0];
          return (
            <li key={p.ref} className="strip__cell">
              <button type="button" onClick={() => setOpen(apiSrc(p.ref, 1600))}
                aria-label={`${name}, visitor photo`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={apiSrc(p.ref, 800)} alt={`${name} — visitor photo`} loading="lazy" draggable={false} />
              </button>
              {/* Google requires the credit to sit with the photo. Not optional. */}
              {credit?.name && <span className="strip__credit">{credit.name} · Google</span>}
            </li>
          );
        })}
      </ul>

      <div className="strip__nav">
        {count > 1 && (
          <>
            <button type="button" className="strip__arrow" onClick={() => page(-1)}
              aria-label="Previous photo">‹</button>
            <button type="button" className="strip__arrow" onClick={() => page(1)}
              aria-label="Next photo">›</button>
          </>
        )}
        <p className="strip__foot">
          {count} photo{count === 1 ? "" : "s"}
        {local.length > 0 && api.length > 0 && ` · ${local.length} his, ${api.length} from Google`}
          {local.length === 0 && api.length > 0 && " from Google"}
        </p>
      </div>

      {open && (
        <div className="lightbox" role="dialog" aria-modal="true"
          aria-label={`${name}, full size`} onClick={close}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={open} alt={name} />
          <button type="button" className="lightbox__close" onClick={close}>Close</button>
        </div>
      )}
    </>
  );
}
