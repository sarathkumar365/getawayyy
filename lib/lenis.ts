import type Lenis from "lenis";

/**
 * The one Lenis instance, reachable outside the component that made it.
 *
 * A panel's close button has to move the PAGE, not just hide itself — the
 * panel's position is a function of scroll, so hiding it without scrolling
 * would put the view and the scroll position into disagreement. Closing
 * therefore scrolls on to the end of that stop, which is the same thing
 * scrolling by hand does.
 */
let current: Lenis | null = null;

export const setLenis = (l: Lenis | null): void => { current = l; };

/** Smoothly scroll to an absolute page offset. Falls back to native. */
export function scrollToY(y: number, duration = 1.1): void {
  if (current) { current.scrollTo(y, { duration }); return; }
  window.scrollTo({ top: y, behavior: "smooth" });
}
