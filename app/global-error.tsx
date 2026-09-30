"use client";

import type { JSX } from "react";

/** Last resort, for an error in the root layout itself: no stylesheet to lean on. */
export default function GlobalError({ reset }: { reset: () => void }): JSX.Element {
  return (
    <html lang="en">
      <body style={{
        margin: 0, minHeight: "100vh", display: "grid", placeItems: "center",
        background: "#FBF8F3", color: "#1A1714", fontFamily: "-apple-system, system-ui, sans-serif",
        padding: 24, textAlign: "center",
      }}>
        <div>
          <h1 style={{ fontWeight: 500 }}>Oops, something tripped.</h1>
          <p>Your answers are saved on this device.</p>
          <p>
            <button type="button" onClick={() => reset()}
              style={{ font: "inherit", padding: "10px 20px", borderRadius: 99, border: "1px solid #CFC3B2", background: "#fff" }}>
              Try again
            </button>
            {" "}<a href="/" style={{ color: "inherit" }}>Back to the start</a>
          </p>
        </div>
      </body>
    </html>
  );
}
