import Link from "next/link";
import type { JSX } from "react";
import "./home-button.css";

/** Always-there way back to the front door, pinned opposite the map button. */
export function HomeButton(): JSX.Element {
  return (
    <Link href="/" className="homebtn" aria-label="Back to home">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M3 11 L12 4 l9 7" strokeLinejoin="round" strokeLinecap="round" />
        <path d="M5.5 9.5 V20 h13 V9.5" strokeLinejoin="round" />
      </svg>
      Home
    </Link>
  );
}
