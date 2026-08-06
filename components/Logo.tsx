import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { site } from "@/lib/site";

/**
 * Brand mark for header/footer — the HML Prism logo (public/logo.svg) beside
 * the wordmark. Swap `/logo.svg` for your own file to rebrand.
 */
export function Logo({
  variant = "dark",
  className,
}: {
  variant?: "dark" | "light";
  className?: string;
}) {
  const textColor = variant === "light" ? "text-white" : "text-navy";

  return (
    <Link
      href="/"
      aria-label={`${site.name} — home`}
      className={cn("group inline-flex items-center gap-2.5", className)}
    >
      <Image
        src="/logo.svg"
        alt=""
        width={40}
        height={40}
        priority
        className="h-9 w-9 transition-transform group-hover:scale-105"
      />
      <span className={cn("text-lg font-bold tracking-tight", textColor)}>
        HML <span className="text-accent">Prism</span>
      </span>
    </Link>
  );
}
