"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { SectionHeading } from "./SectionHeading";
import { Card } from "./Card";
import { Stagger, StaggerItem } from "./Stagger";
import { steps } from "@/lib/site";

// Register plugins client-side only (same client-only guarding convention the
// OGL WebGL component follows). registerPlugin is idempotent.
if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
}

/**
 * "How It Works" — the one section with GSAP ScrollTrigger pinned/scrubbed
 * storytelling (distinct from the Framer Motion `whileInView` reveals used
 * everywhere else).
 *
 * SSR-safety: the markup renders every step in its final ACTIVE state (full
 * opacity, progress line full). That single static markup is also the
 * fallback for reduced-motion, no-JS, and mobile — so nothing is ever hidden
 * and there's no reduced-motion branch in the JSX to cause a hydration flip.
 * GSAP only *overrides* into the scrubbable start state on the client, and only
 * when the matchMedia query (desktop + motion allowed) matches.
 */
export function HowItWorks() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      // gsap.matchMedia is the GSAP-native way to scope scroll behaviour to a
      // breakpoint AND to reduced-motion, and it auto-reverts on teardown.
      const mm = gsap.matchMedia();

      mm.add(
        "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        () => {
          const badges = gsap.utils.toArray<HTMLElement>(".hiw-badge", root);
          const contents = gsap.utils.toArray<HTMLElement>(".hiw-content", root);
          const fill = root.querySelector<HTMLElement>(".hiw-fill");
          if (badges.length < 3 || contents.length < 3 || !fill) return;

          // Client-only scrub START state (transform + opacity only). The server
          // rendered everything active/full; here we recede steps 2 & 3 and empty
          // the progress line so the scrub has somewhere to travel.
          gsap.set(fill, { scaleX: 0, transformOrigin: "left center" });
          gsap.set([badges[1], badges[2], contents[1], contents[2]], { opacity: 0.4 });
          gsap.set([contents[1], contents[2]], { y: 12 });
          gsap.set(badges[0], { scale: 1.2 });

          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: root,
              start: "top top",
              end: "+=2200",
              pin: true,
              anticipatePin: 1,
              scrub: 0.5,
            },
          });

          // Shared progress line draws continuously across the sequence — the
          // spatial anchor the eye follows through all three states. It reaches
          // each badge as that step activates, then holds full during the dwell.
          tl.to(fill, { scaleX: 0.5, duration: 1.0 }, 0).to(
            fill,
            { scaleX: 1, duration: 1.0 },
            1.0,
          );

          // Hand-off step 1 -> step 2.
          tl.to(badges[0], { scale: 1, duration: 0.4 }, 0.8)
            .to([badges[0], contents[0]], { opacity: 0.4, duration: 0.4 }, 0.8)
            .to([badges[1], contents[1]], { opacity: 1, duration: 0.4 }, 0.8)
            .to(badges[1], { scale: 1.2, duration: 0.4 }, 0.8)
            .to(contents[1], { y: 0, duration: 0.4 }, 0.8);

          // Hand-off step 2 -> step 3.
          tl.to(badges[1], { scale: 1, duration: 0.4 }, 1.8)
            .to([badges[1], contents[1]], { opacity: 0.4, duration: 0.4 }, 1.8)
            .to([badges[2], contents[2]], { opacity: 1, duration: 0.4 }, 1.8)
            .to(badges[2], { scale: 1.2, duration: 0.4 }, 1.8)
            .to(contents[2], { y: 0, duration: 0.4 }, 1.8);

          // Dwell: hold step 3 fully active for the final stretch of scroll so it
          // reads clearly before the pin releases (no abrupt handoff-at-release).
          tl.to({}, { duration: 0.8 }, 2.2);
        },
      );
    },
    { scope: rootRef },
  );

  return (
    <section ref={rootRef} className="section">
      <div className="container">
        <SectionHeading
          eyebrow="How it works"
          title="Three steps to launch"
          description="A simple, transparent path from first conversation to live campaigns."
        />

        {/* Mobile (<768px): the existing whileInView stagger — no pin/scrub. */}
        <div className="md:hidden">
          <Stagger className="mt-10 grid gap-6">
            {steps.map((step, i) => (
              <StaggerItem key={step.title} className="h-full">
                <Card className="h-full">
                  <span className="mb-4 grid h-11 w-11 place-items-center rounded-full bg-navy text-lg font-bold text-white">
                    {i + 1}
                  </span>
                  <h3 className="text-lg font-bold text-navy">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {step.description}
                  </p>
                </Card>
              </StaggerItem>
            ))}
          </Stagger>
        </div>

        {/* Desktop/tablet (>=768px): GSAP pinned/scrubbed sequence. Renders fully
            active by default; GSAP takes over on the client when motion is
            allowed. */}
        <div className="hidden md:block">
          <div className="relative mx-auto mt-14 max-w-4xl">
            {/* Badge row with the shared, drawing progress line */}
            <div className="relative grid grid-cols-3">
              <div
                aria-hidden="true"
                className="absolute left-[16.666%] right-[16.666%] top-7 h-1 -translate-y-1/2 rounded-full bg-slate-200"
              >
                <div className="hiw-fill h-full w-full origin-left rounded-full bg-accent" />
              </div>
              {steps.map((step, i) => (
                <div key={step.title} className="flex justify-center">
                  <span className="hiw-badge relative z-10 grid h-14 w-14 place-items-center rounded-full bg-navy text-xl font-bold text-white shadow-lg shadow-navy/20">
                    {i + 1}
                  </span>
                </div>
              ))}
            </div>

            {/* Content row */}
            <div className="mt-8 grid grid-cols-3 gap-8">
              {steps.map((step) => (
                <div key={step.title} className="hiw-content text-center">
                  <h3 className="text-lg font-bold text-navy">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
