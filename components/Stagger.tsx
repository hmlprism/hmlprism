"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

/**
 * Scroll-triggered stagger primitives for section content.
 *
 * `Stagger` is the container (usually the grid itself); it fires once when it
 * scrolls into view and orchestrates its direct `StaggerItem` children so cards
 * cascade in rather than popping simultaneously. Keep the container as the
 * DIRECT parent of the items so variant propagation works.
 *
 * Motion is intentionally restrained (24px slide, ~400ms) and fully disabled
 * for reduced-motion users (children just fade, no transform).
 */

const EASE = [0.22, 1, 0.36, 1] as const;

type Tag = "div" | "ul" | "li" | "section";

interface StaggerProps {
  children: ReactNode;
  className?: string;
  /** Seconds between each child's entrance. */
  stagger?: number;
  /** Delay before the first child animates. */
  delayChildren?: number;
  /** Element to render (e.g. "ul" to keep list semantics). */
  as?: Tag;
}

export function Stagger({
  children,
  className,
  stagger = 0.08,
  delayChildren = 0.05,
  as = "div",
}: StaggerProps) {
  const reduced = useReducedMotion();
  const Comp = motion[as];

  const container: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduced ? 0 : stagger,
        delayChildren: reduced ? 0 : delayChildren,
      },
    },
  };

  return (
    <Comp
      className={className}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      {children}
    </Comp>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  as?: Tag;
}

export function StaggerItem({ children, className, as = "div" }: StaggerItemProps) {
  const reduced = useReducedMotion();
  const Comp = motion[as];

  // Transform-only reveal (no opacity): the server-rendered markup stays visible
  // even if client JS never runs, so content is never stuck invisible — it just
  // sits a few px offset until the scroll-triggered slide plays. `show` always
  // resets to 0 (even for reduced motion) to correct the server-baked offset,
  // since the server can't detect reduced-motion.
  const item: Variants = {
    hidden: { y: reduced ? 0 : 24 },
    show: { y: 0, transition: reduced ? { duration: 0 } : { duration: 0.4, ease: EASE } },
  };

  return (
    <Comp className={className} variants={item}>
      {children}
    </Comp>
  );
}
