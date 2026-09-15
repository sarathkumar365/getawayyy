"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type JSX } from "react";

/**
 * Review nav for the scratch routes.
 *
 * None of these pages is the real site — they are the proving grounds, and this
 * exists so they can be reached on an iPad without typing URLs. It collapses,
 * because a permanent bar across the top would sit right where the walk puts its
 * sky and would be the first thing to lie about how the finished thing looks.
 *
 * Deliberately not in the journey: when the real screens land, this comes out.
 */
const ROUTES: readonly { href: string; label: string; note: string }[] = [
  { href: "/journey/muskoka", label: "Journey", note: "NEW — the whole trip, stops and all" },
  { href: "/panel/muskoka", label: "Panels", note: "every station, all the data" },
  { href: "/corridor", label: "Corridor", note: "one leg, the depth engine alone" },
  { href: "/trip/muskoka", label: "Muskoka", note: "the old flat build, for comparison" },
  { href: "/walk", label: "Walk", note: "movement 1 alone, plus the map" },
  { href: "/stage", label: "Stage", note: "characters, walk cycle, dialogue" },
  { href: "/feel", label: "Feel", note: "a full day, real photos, scroll-driven sky" },
  { href: "/sheets", label: "Sheets", note: "both character designs, every pose" },
  { href: "/", label: "Home", note: "the front door she lands on" },
  { href: "/data", label: "Data", note: "phase 0 scaffold — the workbench" },
];

export function DevNav(): JSX.Element {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const here = ROUTES.find((r) => r.href === path);

  return (
    <nav className={`devnav ${open ? "devnav--open" : ""}`} aria-label="Review routes">
      <button
        type="button"
        className="devnav__toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="devnav__dot" aria-hidden="true" />
        <span className="devnav__here">{here?.label ?? "Review"}</span>
        <span className="devnav__chev" aria-hidden="true">{open ? "×" : "▾"}</span>
      </button>

      <ul className="devnav__list">
        {ROUTES.map((r) => (
          <li key={r.href}>
            <Link
              href={r.href}
              className={r.href === path ? "is-here" : ""}
              onClick={() => setOpen(false)}
            >
              <b>{r.label}</b>
              <i>{r.note}</i>
            </Link>
          </li>
        ))}
        <li className="devnav__foot">Proving grounds — not the finished site.</li>
      </ul>
    </nav>
  );
}
