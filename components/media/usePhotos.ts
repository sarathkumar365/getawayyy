"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type ApiPhoto = {
  ref: string;
  width: number | null;
  height: number | null;
  attribution: { name: string | null; uri: string | null }[];
};

export type Extra =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "none"; why: "no-key" | "not-found" | "empty" }
  | { state: "error" }
  | { state: "ok"; place: string; photos: ApiPhoto[] };

/** Bytes come from /api/photo, so the key never reaches a URL the browser sees. */
export const apiSrc = (ref: string, w: number): string =>
  `/api/photo?ref=${encodeURIComponent(ref)}&w=${w}`;

/**
 * Google photos for one place.
 *
 * Two callers want this with different manners: the grid asks only when she taps
 * "show me more", while the station panel asks on arrival, because 36 of the 37
 * stations have no local photos and a panel that waited for a tap would open
 * empty. `auto` is that difference and the only one.
 *
 * Asking on arrival is affordable because /api/photos sets revalidate = 7 days,
 * so a station costs at most one lookup a week however often she walks past it.
 */
export function usePhotos(query: string | null, name: string, auto = false) {
  const [extra, setExtra] = useState<Extra>({ state: "idle" });
  // A station can mount, unmount and remount as she scrolls back and forth.
  // Without this the same place would be requested again on every pass.
  const asked = useRef(false);

  const load = useCallback(async () => {
    if (!query) return;
    asked.current = true;
    setExtra({ state: "loading" });
    try {
      const res = await fetch(`/api/photos?q=${encodeURIComponent(query)}`);
      const json = (await res.json()) as {
        available: boolean; found?: boolean; place?: string; photos: ApiPhoto[];
      };
      if (!json.available) { setExtra({ state: "none", why: "no-key" }); return; }
      if (json.found === false) { setExtra({ state: "none", why: "not-found" }); return; }
      if (json.photos.length === 0) { setExtra({ state: "none", why: "empty" }); return; }
      setExtra({ state: "ok", place: json.place ?? name, photos: json.photos });
    } catch {
      setExtra({ state: "error" });
    }
  }, [query, name]);

  useEffect(() => {
    if (auto && query && !asked.current) void load();
  }, [auto, query, load]);

  return { extra, load };
}

/** Escape closes the lightbox. Shared by both photo surfaces. */
export function useEscape(open: unknown, close: () => void): void {
  useEffect(() => {
    if (!open) return undefined;
    const esc = (e: KeyboardEvent): void => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open, close]);
}
