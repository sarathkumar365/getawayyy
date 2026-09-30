"use client";

import Link from "next/link";
import { useEffect, type JSX } from "react";

/**
 * Anything that throws while rendering lands here instead of Next's bare
 * "Application error" page. Her answers live in localStorage, so reloading
 * loses nothing.
 */
export default function RouteError(
  { error, reset }: { error: Error & { digest?: string }; reset: () => void },
): JSX.Element {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <main className="crash">
      <h1>Oops, something tripped.</h1>
      <p>Nothing you did. Your answers are saved on this device.</p>
      <div className="crash__acts">
        <button type="button" onClick={() => reset()}>Try again</button>
        <Link href="/">Back to the start</Link>
      </div>
    </main>
  );
}
