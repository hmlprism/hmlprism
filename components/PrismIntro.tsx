"use client";

import { useEffect } from "react";
import { motion, useAnimate, useReducedMotion } from "framer-motion";

/**
 * One-time, timed intro for the Hero prism panel — Framer Motion only (no WebGL /
 * canvas / shaders). The prism logo is decomposed into separately animatable
 * layers so a staged sequence can play on load, matching a real light-refraction
 * diagram (see design-reference/prism-reference-*.png):
 *
 *   1. a single white beam travels in from the lower-left and strikes the prism's
 *      left face at one contact point (HIT),
 *   2. a brief glow pulses at that contact point,
 *   3. the spectrum bursts out of that SAME point, fanning to the right (red top →
 *      violet bottom) and emerging past the prism's right face,
 *   4. the whole panel holds ~2.5s,
 *   5. the ENTIRE panel — frame, glow halo, prism, beam, spectrum and wordmark —
 *      fades and drifts up as one unit and stays gone, leaving only the video.
 *
 * Contact point: HIT is a single shared constant used as the incoming beam's tip,
 * the spectrum fan's apex, and the glow centre — so the beam always terminates ON
 * the glass and the spectrum starts from the exact same point, with no gap (the
 * same shared-contact-point approach the earlier pinned-prism visual used).
 *
 * The sequence is imperative (`useAnimate` + awaited `animate()`), not scroll-
 * triggered — the Hero is in view at load. Only transform/opacity are animated.
 *
 * Reduced motion: no timeline — the complete graphic renders in its final state
 * and stays visible in the panel indefinitely (the intended static fallback).
 *
 * The panel is `pointer-events-none` (decorative, aria-hidden); pointer events
 * fall through to the Hero's tilt wrapper, so the panel tilt still works and no
 * invisible element blocks clicks once the panel has faded out.
 */

// Single shared contact point on the prism's left face — mid-height, slightly
// below the triangle's vertical centre (matches the reference diagrams).
const HIT = { x: 108, y: 254 };

// Incoming beam: drawn horizontally in a local group then translated+rotated so
// its far end lands exactly on HIT, entering from the lower-left (off the panel
// edge) at ~30° up-right.
const BEAM = { ox: -43.6, oy: 341.5, len: 175, deg: -30 };

// Outgoing spectrum: 7 adjacent wedges sharing the apex HIT, fanning to the right
// from -12° (red, up-right) to +30° (violet, down-right) — straddling horizontal
// like the reference diagrams. Far-arc points precomputed at R = 345. The burst
// scales about HIT via a view-box transform-origin (see fanStyle), so red can sit
// above HIT without shifting the apex.
const FAN: { c: string; a: [number, number]; b: [number, number] }[] = [
  { c: "#FF4B4B", a: [445.4, 182.3], b: [451.1, 217.9] }, // red
  { c: "#FF9A2E", a: [451.1, 217.9], b: [453.0, 254.0] }, // orange
  { c: "#FFE24A", a: [453.0, 254.0], b: [451.1, 290.1] }, // yellow
  { c: "#45D67A", a: [451.1, 290.1], b: [445.4, 325.7] }, // green
  { c: "#3AA0FF", a: [445.4, 325.7], b: [436.1, 360.6] }, // blue
  { c: "#6C6BFF", a: [436.1, 360.6], b: [423.2, 394.3] }, // indigo
  { c: "#B45CFF", a: [423.2, 394.3], b: [406.8, 426.5] }, // violet
];

export function PrismIntro() {
  const reduced = useReducedMotion();
  const [scope, animate] = useAnimate();

  useEffect(() => {
    // Reduced motion → render the final static graphic (below) and never animate.
    if (reduced) return;

    let cancelled = false;
    const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

    (async () => {
      // 1 — the single white beam travels in toward the contact point.
      await animate(
        ".pi-beam",
        { opacity: 1, scaleX: 1 },
        { duration: 0.55, ease: "easeOut" },
      );
      if (cancelled) return;

      // 2 — impact glow pulse at the contact point.
      await animate(
        ".pi-glow",
        { opacity: [0, 1, 0.55], scale: [0.4, 1.3, 1] },
        { duration: 0.28, ease: "easeOut" },
      );
      if (cancelled) return;

      // 3 — the spectrum bursts out of the contact point, fanning right.
      await animate(
        ".pi-rainbow",
        { opacity: 1, scale: 1 },
        { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
      );
      if (cancelled) return;

      // wordmark settles in as the burst completes.
      await animate(
        ".pi-wordmark",
        { opacity: 1, y: 0 },
        { duration: 0.35, ease: "easeOut" },
      );
      if (cancelled) return;

      // 4 — hold the complete graphic.
      await wait(2500);
      if (cancelled) return;

      // 5 — exit: the ENTIRE panel (scope) fades and drifts up, then stays gone.
      await animate(
        scope.current,
        { opacity: 0, y: -30 },
        { duration: 0.65, ease: "easeIn" },
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [reduced, animate, scope]);

  // Initial per-layer state, owned by Framer (via `initial`) so React never
  // resets what the timeline sets. Reduced motion starts every animated layer in
  // its FINAL visible state (no timeline runs). Scale origins use fill-box
  // (static CSS, not animated) so each layer scales relative to its own bounds.
  const beamStyle = {
    transformBox: "fill-box" as const,
    transformOrigin: "left center",
  };
  const glowStyle = {
    transformBox: "fill-box" as const,
    transformOrigin: "center",
  };
  const fanStyle = {
    // view-box origin resolves in the SVG's own coordinate system, so the burst
    // scales about the exact contact point HIT regardless of the fan's bounds.
    transformBox: "view-box" as const,
    transformOrigin: `${HIT.x}px ${HIT.y}px`,
  };
  const beamInit = { scaleX: reduced ? 1 : 0, opacity: reduced ? 1 : 0 };
  const glowInit = { scale: reduced ? 1 : 0.4, opacity: reduced ? 0.55 : 0 };
  const fanInit = { scale: reduced ? 1 : 0, opacity: reduced ? 1 : 0 };
  const wordmarkInit = { y: reduced ? 0 : 8, opacity: reduced ? 1 : 0 };

  return (
    // The whole panel is the exit unit: frame + glow halo + graphic + wordmark all
    // fade/drift away together. Decorative + non-interactive.
    <motion.div ref={scope} aria-hidden="true" className="pointer-events-none relative">
      {/* Accent halo behind the frame (fades out with everything else). */}
      <div className="absolute inset-0 -z-10 rounded-[2.5rem] bg-accent/20 blur-3xl" />

      {/* Frosted-glass frame. */}
      <div className="relative flex flex-col items-center gap-6 overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 p-10 shadow-2xl backdrop-blur-sm sm:p-14">
        <svg
          viewBox="0 0 512 512"
          role="img"
          aria-label="HML Prism logo — a prism refracting white light into a spectrum"
          // Horizontal-only nudge so the prism body sits centered in the panel.
          style={{ transform: "translateX(11.8%)" }}
          className="h-auto w-56 drop-shadow-[0_12px_40px_rgba(46,196,182,0.35)] sm:w-64"
        >
          <defs>
            <linearGradient id="pi-leftFace" x1="0" y1="0" x2="0.9" y2="1">
              <stop offset="0" stopColor="#1c4f79" />
              <stop offset="1" stopColor="#07202f" />
            </linearGradient>
            <linearGradient id="pi-rightFace" x1="0.1" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#26608c" />
              <stop offset="1" stopColor="#0d2f4a" />
            </linearGradient>
            <linearGradient id="pi-beamGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="0.4" stopColor="#ffffff" stopOpacity="0.75" />
              <stop offset="1" stopColor="#ffffff" stopOpacity="1" />
            </linearGradient>
            <radialGradient id="pi-innerGlow" cx="0.5" cy="0.4" r="0.7">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
              <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="pi-hitGlow" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.5" />
              <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Spectrum fan — behind the prism, so it visibly emerges from the right
              face and fans out (its apex at HIT stays hidden inside the glass). */}
          <motion.g className="pi-rainbow" style={fanStyle} initial={fanInit}>
            {FAN.map((band) => (
              <polygon
                key={band.c}
                points={`${HIT.x},${HIT.y} ${band.a[0]},${band.a[1]} ${band.b[0]},${band.b[1]}`}
                fill={band.c}
              />
            ))}
          </motion.g>

          {/* Prism body + refraction highlight + edges (static, always visible). */}
          <g className="pi-prism">
            <polygon points="170,88 55,360 202,428" fill="url(#pi-leftFace)" />
            <polygon points="170,88 202,428 336,344" fill="url(#pi-rightFace)" />
            <polygon points="170,88 150,250 250,206" fill="url(#pi-innerGlow)" />
            <g strokeLinecap="round" fill="none">
              <line x1="170" y1="88" x2="202" y2="428" stroke="#4d86b8" strokeOpacity="0.7" strokeWidth="3" />
              <line x1="170" y1="88" x2="55" y2="360" stroke="#2b5f8c" strokeOpacity="0.5" strokeWidth="2.5" />
              <line x1="170" y1="88" x2="336" y2="344" stroke="#2b5f8c" strokeOpacity="0.5" strokeWidth="2.5" />
            </g>
          </g>

          {/* Incoming white beam — enters lower-left, ends exactly at HIT. */}
          <g transform={`translate(${BEAM.ox} ${BEAM.oy}) rotate(${BEAM.deg})`}>
            <motion.rect
              className="pi-beam"
              x="0"
              y="-6"
              width={BEAM.len}
              height="12"
              rx="6"
              fill="url(#pi-beamGrad)"
              style={beamStyle}
              initial={beamInit}
            />
          </g>

          {/* Impact glow exactly at the contact point. */}
          <motion.circle
            className="pi-glow"
            cx={HIT.x}
            cy={HIT.y}
            r="42"
            fill="url(#pi-hitGlow)"
            style={glowStyle}
            initial={glowInit}
          />
        </svg>

        <motion.p
          className="pi-wordmark text-center text-2xl font-bold tracking-tight text-white"
          initial={wordmarkInit}
        >
          HML <span className="text-accent">Prism</span>
        </motion.p>
      </div>
    </motion.div>
  );
}
