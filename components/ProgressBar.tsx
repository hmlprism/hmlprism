"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  label: string;
  value: number; // 0 - 100
}

/** Labelled skill/value bar that fills when scrolled into view. */
export function ProgressBar({ label, value }: ProgressBarProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm font-semibold text-navy">
        <span>{label}</span>
        <span className="text-accent-600">{value}%</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <motion.div
          className="h-full rounded-full bg-accent"
          initial={{ width: 0 }}
          whileInView={{ width: `${value}%` }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
