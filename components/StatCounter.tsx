"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "framer-motion";

interface StatCounterProps {
  value: number;
  suffix?: string;
  label: string;
}

/**
 * Animated number that counts up from zero the first time it scrolls into view.
 * Falls back to the final value immediately for reduced-motion users.
 */
export function StatCounter({ value, suffix = "", label }: StatCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const hasAnimated = useRef(false);
  // Default to the real value so the stat is never stuck at 0 — this is what
  // shows on the server render, without JS, or if the in-view observer never
  // fires. The count-up (below) only overrides it once the section scrolls in.
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (!inView || hasAnimated.current) return;
    hasAnimated.current = true;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      setDisplay(value);
      return;
    }

    setDisplay(0);
    const controls = animate(0, value, {
      duration: 1.6,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl font-bold text-white sm:text-5xl">
        {display}
        <span className="text-accent">{suffix}</span>
      </div>
      <div className="mt-2 text-sm font-medium uppercase tracking-wide text-navy-100">
        {label}
      </div>
    </div>
  );
}
