"use client";

import { useRef, type ReactNode, type MouseEvent } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

interface MagneticProps {
  children: ReactNode;
  className?: string;
  /**
   * How strongly the element is pulled toward the cursor, as a fraction of the
   * distance from center. 0.3 keeps the shift subtle and bounded to the element.
   */
  strength?: number;
}

/**
 * Wraps an interactive element so it drifts slightly toward the cursor while
 * hovered, then springs back on leave. The mousemove listener is scoped to the
 * element's own bounding box (attached to this wrapper only), so it stays cheap.
 * Disabled entirely for reduced-motion users.
 */
export function Magnetic({ children, className, strength = 0.3 }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springConfig = { stiffness: 220, damping: 16, mass: 0.35 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  function handleMove(e: MouseEvent<HTMLDivElement>) {
    if (reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const relX = e.clientX - (rect.left + rect.width / 2);
    const relY = e.clientY - (rect.top + rect.height / 2);
    x.set(relX * strength);
    y.set(relY * strength);
  }

  function handleLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={reduced ? undefined : { x: springX, y: springY }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
