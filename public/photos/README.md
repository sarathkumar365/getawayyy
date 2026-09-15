# Drop photos here

One folder per stop, named with the stop's **name**, lowercased, with every run
of non-alphanumeric characters turned into a single dash:

```
public/photos/
  muskoka-heritage-place/      <- "Muskoka Heritage Place"
    01.jpg
    02.jpg
  lions-lookout-at-sunset/     <- "Lions Lookout at sunset"
    01.jpg
```

Stops in `trips.json` have no id and no slug, only a name — so the name is the
key. It is also the more useful one: "Muskoka Wharf coffee" and "Late lunch at
the wharf" share a single `maps_query` but want different photos.

Then run:

```bash
bun run photos
```

That writes `data/photos.json`, which the gallery reads. Photos already here are
the primary source — the Places API is only the "show me more" overflow, so a
stop with good local photos never calls it.

Accepted: `.jpg` `.jpeg` `.png` `.webp` `.avif`. Files are served straight from
`/public`, optimised by `next/image` at the iPad sizes set in `next.config.ts`.
