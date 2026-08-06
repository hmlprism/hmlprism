"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  /** Delay in seconds before the entrance animation begins. */
  delay?: number;
  className?: string;
  /** Direction the element travels in from. */
  from?: "up" | "down" | "left" | "right";
  as?: "div" | "section" | "li" | "article";
}

const offsets: Record<NonNullable<RevealProps["from"]>, { x: number; y: number }> = {
  up: { x: 0, y: 24 },
  down: { x: 0, y: -24 },
  left: { x: 24, y: 0 },
  right: { x: -24, y: 0 },
};

/**
 * Subtle scroll-reveal wrapper. Animates once when the element enters the
 * viewport.
 *
 * SSR-safety: the reveal animates ONLY transforms (a small slide), never
 * `opacity`. The server-rendered markup is therefore fully visible (just offset
 * a few px), so content is never stuck invisible if client JS is delayed or
 * fails. Reduced-motion users get no movement at all.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  from = "up",
  as = "div",
}: RevealProps) {
  const MotionTag = motion[as];
  const reduced = useReducedMotion();
  const { x, y } = reduced ? { x: 0, y: 0 } : offsets[from];

  return (
    <MotionTag
      className={className}
      initial={{ x, y }}
      whileInView={{ x: 0, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  );
}
