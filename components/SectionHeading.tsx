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
}

/** Consistent eyebrow + title + description block used across sections. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
  as: Tag = "h2",
}: SectionHeadingProps) {
  return (
    <Reveal
      className={cn(
        "max-w-2xl",
        align === "center" ? "mx-auto text-center" : "text-left",
        className,
      )}
    >
      {eyebrow && (
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-accent-600">
          {eyebrow}
        </p>
      )}
      <Tag className="text-3xl font-bold leading-tight text-navy sm:text-4xl">
        {title}
      </Tag>
      {description && (
        <p className="mt-4 text-base leading-relaxed text-slate-600">{description}</p>
      )}
    </Reveal>
  );
}
