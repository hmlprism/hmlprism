"use client";

import { useRef, type MouseEvent } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Button } from "./Button";
import { Icon } from "./Icon";
import { Magnetic } from "./Magnetic";
import { PrismWebGL } from "./PrismWebGL";

// Register plugins client-side only (same client-only guarding convention as
// HowItWorks and the OGL WebGL component). registerPlugin is idempotent.
if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
}

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Home hero with a staggered load entrance, magnetic CTA buttons and a prism
 * panel that idle-floats and tilts toward the cursor, layered over a contained
 * WebGL gradient accent. Continuous/pointer motion is disabled for
 * reduced-motion users.
 *
 * SSR-safety (fixes a production regression where the hero shipped invisible):
 * this is above-the-fold, so it must NEVER depend on JS to become visible. The
 * entrance therefore animates ONLY transforms (a small slide) and never
 * `opacity` — the hidden variant keeps `opacity: 1`, so the server-rendered
 * markup is fully visible (just offset a few px). If hydration is delayed or
 * fails entirely, the hero stays readable instead of stuck at `opacity: 0`.
 *
 * Scroll-exit parallax (GSAP ScrollTrigger, lighter sibling of HowItWorks'
 * pin/scrub — no pin, just scroll-linked transforms): as the hero scrolls past,
 * the copy column drifts up faster than native scroll and fades to 0, while the
 * prism panel drifts up more slowly and scales down slightly, so the two layers
 * separate in depth. GSAP animates dedicated WRAPPER divs (`copyRef`,
 * `panelRef`) — never the Framer Motion elements — so the entrance (Framer) and
 * the scroll-exit (GSAP) are two systems on two different DOM nodes and never
 * fight over `transform`/`opacity`. SSR-safe: the wrappers render with no inline
 * style (opacity 1, no transform); GSAP only applies the scrub start state on
 * the client, inside a reduced-motion-gated matchMedia, so reduced-motion / no-JS
 * users simply scroll the hero natively.
 */
export function Hero() {
  const reduced = useReducedMotion();

  // GSAP scroll-exit targets — plain wrappers, kept separate from the Framer
  // Motion nodes so the two animation systems never share a transform target.
  const rootRef = useRef<HTMLElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const panelParallaxRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      const copy = copyRef.current;
      const panel = panelParallaxRef.current;
      if (!root || !copy || !panel) return;

      // matchMedia scopes the effect to motion-allowed users (and auto-reverts
      // on teardown / when the query stops matching — no manual cleanup, no
      // hydration branch in the JSX). The parallax is cheap enough (transform +
      // opacity, scrub) to run at every width, so no min-width gate here.
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Copy column: recedes AHEAD of native scroll and fades out. A scrubbed
        // timeline lets the y-drift span the whole hero-exit range while the
        // opacity finishes earlier (~80% of the range) — so the copy is fully
        // transparent by the time it has cleared the top of the viewport, not
        // lingering faintly visible or bleeding the fade past the hero.
        gsap
          .timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: root,
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          })
          .to(copy, { yPercent: -35, duration: 1 }, 0)
          .to(copy, { opacity: 0, duration: 0.8 }, 0);

        // Prism panel: drifts up more slowly than the copy and scales down a
        // touch, so it appears to recede into the distance behind the copy.
        gsap.to(panel, {
          yPercent: -12,
          scale: 0.92,
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      });
    },
    { scope: rootRef },
  );

  // ---- Entrance (staggered on load; transform-only so it's never invisible) --
  const container: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduced ? 0 : 0.12,
        delayChildren: reduced ? 0 : 0.1,
      },
    },
  };
  // `show` always resets the transform to 0 (even for reduced motion) so it
  // corrects the offset the server baked in — the server can't detect
  // reduced-motion, so it always renders the non-reduced offset.
  const item: Variants = {
    hidden: { y: reduced ? 0 : 20 },
    show: { y: 0, transition: reduced ? { duration: 0 } : { duration: 0.5, ease: EASE } },
  };
  const lineGroup: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduced ? 0 : 0.1 } },
  };
  const panelEntrance: Variants = {
    hidden: { x: reduced ? 0 : 40 },
    show: {
      x: 0,
      transition: reduced ? { duration: 0 } : { duration: 0.6, delay: 0.25, ease: EASE },
    },
  };

  // ---- Prism panel pointer tilt -------------------------------------------
  const panelRef = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0); // -0.5..0.5 across panel width
  const py = useMotionValue(0); // -0.5..0.5 across panel height
  const springConfig = { stiffness: 150, damping: 18, mass: 0.4 };
  const sx = useSpring(px, springConfig);
  const sy = useSpring(py, springConfig);
  // Small range so it reads as responsive, not gimmicky (max ~6deg).
  const rotateY = useTransform(sx, [-0.5, 0.5], [-6, 6]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [6, -6]);

  function handlePanelMove(e: MouseEvent<HTMLDivElement>) {
    if (reduced || !panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width - 0.5);
    py.set((e.clientY - rect.top) / rect.height - 0.5);
  }
  function handlePanelLeave() {
    px.set(0);
    py.set(0);
  }

  return (
    <section ref={rootRef} className="relative overflow-hidden bg-navy text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-24 h-96 w-96 rounded-full bg-accent/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-accent/10 blur-3xl"
      />

      <div className="container relative grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
        {/* ---- Copy column (GSAP scroll-exit wrapper → Framer entrance) ---- */}
        <div ref={copyRef}>
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.p
            variants={item}
            className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-accent"
          >
            Digital Marketing &amp; Advertising
          </motion.p>

          <motion.h1
            variants={lineGroup}
            className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl"
          >
            <motion.span variants={item} className="block">
              Refract your brand into
            </motion.span>
            <motion.span variants={item} className="block text-accent">
              measurable growth
            </motion.span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-6 max-w-xl text-lg leading-relaxed text-navy-100"
          >
            HML Prism runs data-driven advertising campaigns and builds the custom
            websites they point to — turning attention into revenue with sharp
            creative and radically transparent reporting.
          </motion.p>

          <motion.div variants={item} className="mt-8 flex flex-wrap gap-4">
            <Magnetic className="inline-flex">
              <Button href="/contact" variant="accent" size="lg">
                Get Started
                <Icon name="arrow-right" size={18} />
              </Button>
            </Magnetic>
            <Magnetic className="inline-flex">
              <Button
                href="/contact"
                size="lg"
                className="border border-white/30 text-white hover:border-accent hover:text-accent"
              >
                Free Consultation
              </Button>
            </Magnetic>
          </motion.div>
        </motion.div>
        </div>

        {/* ---- Prism panel (GSAP scroll-exit wrapper → Framer entrance + idle
            float + pointer tilt + WebGL) ---- */}
        <div ref={panelParallaxRef}>
        <motion.div
          variants={panelEntrance}
          initial="hidden"
          animate="show"
          className="relative mx-auto max-w-md"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 rounded-[2.5rem] bg-accent/20 blur-3xl"
          />

          <motion.div
            ref={panelRef}
            onMouseMove={handlePanelMove}
            onMouseLeave={handlePanelLeave}
            style={{ perspective: 900 }}
          >
            <motion.div
              animate={reduced ? undefined : { y: [0, -10, 0] }}
              transition={
                reduced
                  ? undefined
                  : { duration: 6, repeat: Infinity, ease: "easeInOut" }
              }
            >
              <motion.div
                style={
                  reduced
                    ? undefined
                    : { rotateX, rotateY, transformStyle: "preserve-3d" }
                }
                className="relative flex flex-col items-center gap-6 overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 p-10 shadow-2xl backdrop-blur-sm sm:p-14"
              >
                <PrismWebGL className="pointer-events-none absolute inset-0" />
                <Image
                  src="/logo.svg"
                  alt="HML Prism logo — a prism refracting light into a full spectrum"
                  width={320}
                  height={320}
                  className="relative z-10 h-auto w-56 drop-shadow-[0_12px_40px_rgba(46,196,182,0.35)] sm:w-64"
                  priority
                />
                <p className="relative z-10 text-center text-2xl font-bold tracking-tight text-white">
                  HML <span className="text-accent">Prism</span>
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
        </div>
      </div>
    </section>
  );
}
