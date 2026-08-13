import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  /** Render the heading as h1 (e.g. page heroes). Defaults to h2. */
  as?: "h1" | "h2";
  /**
   * Colour theme for the text. "light" (default) is dark text for light
   * backgrounds; "dark" is light text for use over a dark video/overlay.
   */
  theme?: "light" | "dark";
}

/** Consistent eyebrow + title + description block used across sections. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
  as: Tag = "h2",
  theme = "light",
}: SectionHeadingProps) {
  const dark = theme === "dark";
  return (
    <Reveal
      className={cn(
        "max-w-2xl",
        align === "center" ? "mx-auto text-center" : "text-left",
        className,
      )}
    >
      {eyebrow && (
        <p
          className={cn(
            "mb-3 text-sm font-semibold uppercase tracking-[0.2em]",
            dark ? "text-accent-300" : "text-accent-600",
          )}
        >
          {eyebrow}
        </p>
      )}
      <Tag
        className={cn(
          "text-3xl font-bold leading-tight sm:text-4xl",
          dark ? "text-white" : "text-navy",
        )}
      >
        {title}
      </Tag>
      {description && (
        <p
          className={cn(
            "mt-4 text-base leading-relaxed",
            dark ? "text-navy-100" : "text-slate-600",
          )}
        >
          {description}
        </p>
      )}
    </Reveal>
  );
}
