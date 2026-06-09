"use client";

/**
 * Decorative ambient gradient orbs for pages with plain backgrounds.
 * Pure CSS — animates via globals.css keyframes (orb-drift-*).
 */
export function PageAccents() {
  return (
    <div aria-hidden className="page-accents" style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none", overflow: "hidden" }}>
      <span className="page-accent-orb page-accent-orb--1" />
      <span className="page-accent-orb page-accent-orb--2" />
      <span className="page-accent-orb page-accent-orb--3" />
    </div>
  );
}
