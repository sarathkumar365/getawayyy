"use client";

import type { JSX } from "react";

/**
 * Muskoka's map, brought across from the Muskoka Weekend artifact as-is.
 *
 * The other four trips draw themselves from the Phase-0 coordinates. This one
 * does not: it was hand-drawn, it was asked for by name, and its lakes are the
 * one piece of invented geometry in the build that is allowed to stay — they
 * are the reason it reads as a map rather than a diagram. Everything else on
 * it is true: real towns, real order, real distances between them.
 */

const SERIF = "var(--font-display), Georgia, serif";
const MONO = "var(--font-mono), monospace";
const SANS = "var(--font-body), sans-serif";

export const MUSKOKA_NOTE =
  "Bracebridge sits between the two days \u2014 Huntsville is 35 minutes north, " +
  "Gravenhurst 25 minutes south. Neither day doubles back, and Sunday finishes " +
  "pointed at home.";

export function MuskokaMap(): JSX.Element {
  return (
    <>
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

    </>
  );
}
