import manifest from "@/data/photos.json";

export type PhotoManifest = {
  generated: string;
  stops: Record<string, string[]>;
};

const data = manifest as PhotoManifest;

/**
 * Stops in the file carry no `id` and no `slug` — only a name and a maps_query.
 * So the folder key is the slugified stop NAME, which is also what anyone would
 * naturally type when making the folder.
 *
 * Name beats maps_query as the key because queries repeat: "Muskoka Wharf coffee"
 * and "Late lunch at the wharf" share one maps_query but want different photos.
 */
export function stopSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Local photos for a stop, in filename order. Empty when none have been added yet. */
export function localPhotos(slug: string | null | undefined): readonly string[] {
  if (!slug) return [];
  return data.stops[slug] ?? [];
}

/** Convenience: photos for a stop by its name. */
export function photosForStop(name: string): readonly string[] {
  return localPhotos(stopSlug(name));
}

export function hasLocalPhotos(slug: string | null | undefined): boolean {
  return localPhotos(slug).length > 0;
}

export const photoCount: number =
  Object.values(data.stops).reduce((n, a) => n + a.length, 0);
