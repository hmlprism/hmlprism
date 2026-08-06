import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  /** Lift + accent border on hover. */
  interactive?: boolean;
}

/** Generic surface card with rounded corners and soft shadow. */
export function Card({ children, className, interactive = false }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8",
        interactive &&
          "transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-lg",
        className,
      )}
    >
      {children}
    </div>
  );
}
