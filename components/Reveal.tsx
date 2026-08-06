"use client";

import { motion } from "framer-motion";
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
 * viewport and respects users' reduced-motion preferences via Framer Motion.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  from = "up",
  as = "div",
}: RevealProps) {
  const MotionTag = motion[as];
  const { x, y } = offsets[from];

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  );
}
