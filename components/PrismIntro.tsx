"use client";

import { useEffect } from "react";
import { motion, useAnimate, useReducedMotion } from "framer-motion";

/**
 * One-time, timed intro for the Hero panel's prism graphic — Framer Motion only
 * (no WebGL / canvas / shaders). The graphic is the logo.svg decomposed into
 * separately animatable layers so a staged sequence can play on load:
 *
 *   1. light travels in from the top-left toward the prism (beam scaleX grows
 *      from its outer end to the glass),
 *   2. a brief impact glow pulses where it enters,
 *   3. the rainbow bursts out of the prism's far face (scaleX grows from the
 *      exit point outward),
 *   4. the whole graphic holds ~2.5s,
 *   5. the whole graphic (prism + beam + rainbow + wordmark) fades and drifts up
 *      as one unit and stays gone.
 *
 * The sequence is imperative (`useAnimate` + awaited `animate()` calls) rather
 * than scroll-triggered — the Hero is in view at load. Only `transform`/`opacity`
 * are animated. `transform-box: fill-box` scopes each layer's scale origin to its
 * own bounding box, so the beam grows toward the prism and the rainbow grows away
 * from it regardless of the surrounding SVG coordinate system.
 *
 * Reduced motion: no timeline at all — the complete graphic renders in its final
 * state and stays visible (same "static final state" convention the Hero panel
 * already uses for its reduced-motion fallback).
 *
 * Cleanup: the graphic is `pointer-events-none` throughout (it's decorative), so
 * even after it has faded to `opacity: 0` it never intercepts clicks; and because
 * the exit animates transform/opacity only, the panel keeps its size (no collapse
 * to an empty box) once the graphic is gone.
 */

// Where the incoming beam meets the glass (top of the left face) — the impact
// glow sits here, matching logo.svg's beam/prism geometry.
const HIT_X = 176;
const HIT_Y = 108;

export function PrismIntro() {
  const reduced = useReducedMotion();
  const [scope, animate] = useAnimate();

  useEffect(() => {
    // Reduced motion → render the final static graphic (below) and never animate.
    if (reduced) return;

    let cancelled = false;
    const wait = (ms: number) =>
      new Promise<void>((r) => setTimeout(r, ms));

    (async () => {
      // 1 — light travels in toward the prism (grows from its outer end).
      await animate(
        ".pi-beam",
        { opacity: 1, scaleX: 1 },
        { duration: 0.55, ease: "easeOut" },
      );
      if (cancelled) return;

      // 2 — impact: a quick glow pulse right where the beam enters the glass.
      await animate(
        ".pi-glow",
        { opacity: [0, 1, 0.55], scale: [0.4, 1.25, 1] },
        { duration: 0.28, ease: "easeOut" },
      );
      if (cancelled) return;

      // 3 — rainbow burst out of the far face (grows from the exit point outward).
      await animate(
        ".pi-rainbow",
        { opacity: 1, scaleX: 1 },
        { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
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

      // 5 — exit: the whole unit fades and drifts up, then stays gone.
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
  // resets what the timeline sets. Reduced motion starts every layer in its
  // FINAL visible state (no timeline runs); otherwise the animated layers start
  // hidden and are revealed by the sequence above. Scale origins use fill-box
  // (static CSS, not animated) so each layer scales relative to its own bounds.
  const fillLeft = {
    transformBox: "fill-box" as const,
    transformOrigin: "left center",
  };
  const fillCenter = {
    transformBox: "fill-box" as const,
    transformOrigin: "center",
  };
  const beamInit = { scaleX: reduced ? 1 : 0, opacity: reduced ? 1 : 0 };
  const glowInit = { scale: reduced ? 1 : 0.4, opacity: reduced ? 0.55 : 0 };
  const rainbowInit = { scaleX: reduced ? 1 : 0, opacity: reduced ? 1 : 0 };
  const wordmarkInit = { y: reduced ? 0 : 8, opacity: reduced ? 1 : 0 };

  return (
    // Decorative + non-interactive: never blocks the panel's pointer tilt or
    // clicks, before, during, or after the sequence.
    <motion.div
      ref={scope}
      aria-hidden="true"
      className="pointer-events-none relative z-10 flex flex-col items-center gap-6"
    >
      <svg
        viewBox="0 0 512 512"
        role="img"
        aria-label="HML Prism logo — a prism refracting light into a full spectrum"
        // Horizontal-only nudge so the prism body sits centered in the panel
        // (its centroid is ~12% left of the viewBox centre). Vertical position
        // and scale are unchanged.
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
            <stop offset="1" stopColor="#ffffff" stopOpacity="0.85" />
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
          <linearGradient id="pi-fade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="0.75" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0.45" />
          </linearGradient>
        </defs>

        {/* Refracted spectrum — bursts out of the right face (behind the prism). */}
        <g transform="translate(248 206) rotate(-30)">
          <motion.g className="pi-rainbow" style={fillLeft} initial={rainbowInit}>
            <rect x="-24" y="-42" width="292" height="12" fill="#FF5A5A" />
            <rect x="-24" y="-30" width="292" height="12" fill="#FF9F3A" />
            <rect x="-24" y="-18" width="292" height="12" fill="#FFE24A" />
            <rect x="-24" y="-6" width="292" height="12" fill="#45D67A" />
            <rect x="-24" y="6" width="292" height="12" fill="#3AA0FF" />
            <rect x="-24" y="18" width="292" height="12" fill="#6C6BFF" />
            <rect x="-24" y="30" width="292" height="12" fill="#B45CFF" />
            <rect x="-24" y="-42" width="292" height="84" fill="url(#pi-fade)" />
          </motion.g>
        </g>

        {/* Incoming white light beam entering the left face. */}
        <motion.polygon
          className="pi-beam"
          points="8,152 8,182 176,120 176,96"
          fill="url(#pi-beamGrad)"
          style={fillLeft}
          initial={beamInit}
        />

        {/* Prism body + refraction highlight + edges — visible from the start so
            the incoming light has a prism to enter. */}
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

        {/* Impact glow at the entry point (pulses on beam arrival, then holds). */}
        <motion.circle
          className="pi-glow"
          cx={HIT_X}
          cy={HIT_Y}
          r="46"
          fill="url(#pi-hitGlow)"
          style={fillCenter}
          initial={glowInit}
        />
      </svg>

      <motion.p
        className="pi-wordmark text-center text-2xl font-bold tracking-tight text-white"
        initial={wordmarkInit}
      >
        HML <span className="text-accent">Prism</span>
      </motion.p>
    </motion.div>
  );
}
