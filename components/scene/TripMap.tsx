"use client";

import { useCallback, useEffect, type JSX } from "react";

/**
 * The route, as an honest diagram.
 *
 * This is the map from the Muskoka Weekend artifact, brought across as-is:
 * the same geometry, the same three day-routes, the same lakes. It does not
 * pretend to be a real map — there is no shoreline data in this project, and
 * sketching Georgian Bay from memory is exactly the kind of invention the rest
 * of the build refuses. What it shows is true: real towns, real order, real
 * distances between them.
 *
 * The type stacks are the project's own rather than the artifact's three
 * imported families, which would otherwise have fallen back silently.
 */

const SERIF = "var(--font-display), Georgia, serif";
const MONO = "var(--font-mono), monospace";
const SANS = "var(--font-body), sans-serif";

export function TripMap({ open, onClose }: { open: boolean; onClose: () => void }): JSX.Element | null {
  const close = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    if (!open) return undefined;
    const esc = (e: KeyboardEvent): void => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", esc);
    // The walk behind must not scroll while the map is over it.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", esc);
      document.body.style.overflow = prev;
    };
  }, [open, close]);

  if (!open) return null;

  return (
    <div className="tripmap" role="dialog" aria-modal="true" aria-label="Map of the route">
      <div className="tripmap__sheet">
        <header className="tripmap__head">
          <div>
            <h2>The route</h2>
            <p>
              Bracebridge sits between the two days — Huntsville is 35 minutes north,
              Gravenhurst 25 minutes south. Neither day doubles back, and Sunday finishes
              pointed at home.
            </p>
          </div>
          <button type="button" className="tripmap__close" onClick={close} aria-label="Close the map">
            Close
          </button>
        </header>

        <div className="mapbox">
          <svg viewBox="-34 -26 524 726" role="img"
            aria-label="Map of the Muskoka route from Gravenhurst north to Huntsville and Arrowhead, with Dorset to the east">
            <rect x="-34" y="-26" width="524" height="726" fill="#e3ded4" />

            {/* water */}
            <g fill="#b9cdd2" stroke="#8fadb5" strokeWidth="1">
              <path d="M8 500 L44 486 L58 508 L40 546 L2 560 L-14 530 Z" />
              <path d="M-20 430 L18 414 L46 438 L30 470 L-6 474 L-24 452 Z" />
              <path d="M140 118 L186 104 L214 124 L200 150 L158 156 L132 140 Z" />
              <path d="M150 62 L182 50 L200 70 L184 88 L154 86 Z" />
              <path d="M366 190 L432 172 L456 200 L428 238 L378 236 L356 214 Z" />
            </g>
            <text x="16" y="528" fontFamily={SERIF} fontStyle="italic" fontSize="11" fill="#5b7a82">Lake Muskoka</text>
            <text x="152" y="134" fontFamily={SERIF} fontStyle="italic" fontSize="10" fill="#5b7a82">Fairy Lk</text>
            <text x="380" y="212" fontFamily={SERIF} fontStyle="italic" fontSize="11" fill="#5b7a82">Lake of Bays</text>

            {/* Hwy 11 spine */}
            <polyline points="56,549 103,425 171,127" fill="none" stroke="#c9b98e" strokeWidth="9"
              strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="56,549 103,425 171,127" fill="none" stroke="#a8945f" strokeWidth="1.4"
              strokeDasharray="7 7" />
            <text x="118" y="300" fontFamily={MONO} fontSize="10" fill="#7d6c3c"
              transform="rotate(-76 118 300)">HWY 11</text>

            {/* Sunday: Gravenhurst cluster + home */}
            <polyline points="103,425 56,549 53,545 66,557 93,582" fill="none" stroke="#9c4a2f"
              strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
            {/* Friday: in from Toronto */}
            <polyline points="56,660 56,549 103,425" fill="none" stroke="#b4832c"
              strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
            {/* Saturday: north loop */}
            <polyline points="103,425 171,127 176,132 169,48 181,123 103,425" fill="none" stroke="#2f5d52"
              strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
            {/* Dorset alternate */}
            <polyline points="181,123 300,168 413,212" fill="none" stroke="#2f5d52" strokeWidth="2.2"
              strokeDasharray="6 6" strokeLinecap="round" />

            {/* Toronto arrow */}
            <line x1="56" y1="660" x2="56" y2="612" stroke="#6d6458" strokeWidth="1.6" />
            <polygon points="56,668 50,652 62,652" fill="#6d6458" />
            <text x="70" y="652" fontFamily={MONO} fontSize="10" fill="#4f4a42">TORONTO</text>
            <text x="70" y="665" fontFamily={MONO} fontSize="9" fill="#7a7368">170 km · 1h45</text>

            {/* nodes */}
            <g stroke="#2a3330" strokeWidth="1.6" fill="#f5f2ec">
              <circle cx="56" cy="549" r="6.5" />
              <circle cx="103" cy="425" r="8" />
              <circle cx="171" cy="127" r="6.5" />
              <circle cx="169" cy="48" r="5" />
              <circle cx="181" cy="123" r="5" />
              <circle cx="93" cy="582" r="5" />
              <circle cx="413" cy="212" r="5" />
            </g>
            <circle cx="103" cy="425" r="3" fill="#9c4a2f" />

            <g fontFamily={SANS} fontSize="12.5" fontWeight="600" fill="#222b28">
              <text x="-30" y="553">Gravenhurst</text>
              <text x="116" y="423">Bracebridge</text>
              <text x="184" y="131">Huntsville</text>
            </g>
            <g fontFamily={MONO} fontSize="9.5" fill="#55605b">
              <text x="104" y="586">Pottery</text>
              <text x="180" y="44">Arrowhead</text>
              <text x="194" y="120">Lions Lookout</text>
              <text x="382" y="230">Dorset Tower</text>
              <text x="116" y="437">base · 2 nights</text>
            </g>
          </svg>
        </div>

        <div className="maplegend">
          <span><i style={{ background: "#b4832c" }} />Friday in</span>
          <span><i style={{ background: "#2f5d52" }} />Saturday north</span>
          <span><i style={{ background: "#9c4a2f" }} />Sunday home</span>
          <span><i style={{ background: "#2f5d52", height: 2, opacity: .6 }} />Dorset option</span>
        </div>

        <div className="daylinks">
          <a className="btn" target="_blank" rel="noopener noreferrer"
            href="https://www.google.com/maps/dir/?api=1&origin=Toronto,ON&destination=Bracebridge,ON&waypoints=Sawdust+City+Brewing,397+Muskoka+Rd+N,Gravenhurst,ON&travelmode=driving">
            Friday route in Maps
          </a>
          <a className="btn" target="_blank" rel="noopener noreferrer"
            href="https://www.google.com/maps/dir/?api=1&origin=Bracebridge,ON&destination=Bracebridge,ON&waypoints=Muskoka+Heritage+Place,88+Brunel+Rd,Huntsville,ON%7CMain+Street,Huntsville,ON%7CArrowhead+Provincial+Park,Huntsville,ON%7CLions+Lookout,Huntsville,ON&travelmode=driving">
            Saturday route in Maps
          </a>
          <a className="btn" target="_blank" rel="noopener noreferrer"
            href="https://www.google.com/maps/dir/?api=1&origin=Bracebridge,ON&destination=Toronto,ON&waypoints=Gravenhurst+Opera+House,Gravenhurst,ON%7CBethune+Memorial+House,235+John+St+N,Gravenhurst,ON%7CMuskoka+Bay+Pottery,1026+North+Muldrew+Lake+Rd,Gravenhurst,ON&travelmode=driving">
            Sunday route in Maps
          </a>
        </div>
      </div>
    </div>
  );
}
