"use client";

import Image from "next/image";
import { useCallback, useState, type JSX } from "react";
import { usePhotos, useEscape, apiSrc, type ApiPhoto } from "./usePhotos";

export type { ApiPhoto };

export type PhotoGalleryProps = {
  /** Stop name, for alt text. */
  name: string;
  /** Photos shipped in /public — the primary source. */
  local: readonly string[];
  /** `maps_query` for this stop. Without one, "show me more" is not offered. */
  query: string | null;
  className?: string;
};

/**
 * Photos for one stop.
 *
 * Local photos are the primary source and render first; the Places API is the
 * overflow behind "show me more", so a stop with good photos never makes a
 * request. When no key is configured the button simply does not appear — that
 * is a normal state here, not a failure to report.
 *
 * Google requires attribution to be shown WITH the photo, so every API image
 * carries its photographer credit. That is not optional and not decoration.
 */
export function PhotoGallery({ name, local, query, className }: PhotoGalleryProps): JSX.Element {
  const { extra, load } = usePhotos(query, name);
  const [open, setOpen] = useState<string | null>(null);
  const close = useCallback(() => setOpen(null), []);
  useEscape(open, close);

  const nothingYet = local.length === 0 && extra.state !== "ok";

  return (
    <figure className={`gallery ${className ?? ""}`}>
      {local.length > 0 && (
        <ul className="gallery__grid">
          {local.map((src, i) => (
            <li key={src}>
              <button type="button" className="gallery__cell" onClick={() => setOpen(src)}>
                <Image
                  src={src}
                  alt={`${name} — photo ${i + 1}`}
                  fill
                  sizes="(max-width: 700px) 50vw, 300px"
                  style={{ objectFit: "cover" }}
                  priority={i === 0}
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      {extra.state === "ok" && (
        <ul className="gallery__grid gallery__grid--api">
          {extra.photos.map((p) => {
            const credit = p.attribution[0];
            return (
              <li key={p.ref}>
                <button type="button" className="gallery__cell" onClick={() => setOpen(apiSrc(p.ref, 1400))}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={apiSrc(p.ref, 600)} alt={`${extra.place} — visitor photo`} loading="lazy" />
                </button>
                {credit?.name && (
                  <span className="gallery__credit">
                    {credit.uri
                      ? <a href={credit.uri} target="_blank" rel="noreferrer noopener">{credit.name}</a>
                      : credit.name}
                    {" · Google"}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {nothingYet && (
        <p className="gallery__empty">
          No photos for {name} yet.
        </p>
      )}

      <figcaption className="gallery__foot">
        {query && extra.state === "idle" && (
          <button type="button" className="gallery__more" onClick={() => void load()}>
            Show me more
          </button>
        )}
        {extra.state === "loading" && <span className="gallery__status">looking…</span>}
        {extra.state === "none" && (
          <span className="gallery__status">
            {extra.why === "no-key"
              ? "More photos need the Places key — the trip itself is unaffected."
              : extra.why === "not-found"
                ? "Google has no listing for this one."
                : "Google has a listing, but no photos."}
          </span>
        )}
        {extra.state === "error" && (
          <button type="button" className="gallery__more" onClick={() => void load()}>
            That didn&apos;t load. Try again
          </button>
        )}
        {extra.state === "ok" && (
          <span className="gallery__status">
            {extra.photos.length} more from Google · photos by their authors
          </span>
        )}
      </figcaption>

      {open && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={`${name}, full size`}
          onClick={() => setOpen(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={open} alt={name} />
          <button type="button" className="lightbox__close" onClick={() => setOpen(null)}>Close</button>
        </div>
      )}
    </figure>
  );
}
