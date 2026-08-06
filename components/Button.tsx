import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "accent" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary: "bg-navy text-white hover:bg-navy-600",
  accent: "bg-accent text-navy-900 hover:bg-accent-500 hover:text-white",
  outline:
    "border border-navy/20 text-navy hover:border-accent hover:text-accent bg-transparent",
  ghost: "text-navy hover:text-accent",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-base",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

type ButtonAsLink = CommonProps & { href: string } & Omit<
    ComponentProps<typeof Link>,
    "href" | "className" | "children"
  >;

type ButtonAsButton = CommonProps & { href?: undefined } & Omit<
    ComponentProps<"button">,
    "className" | "children"
  >;

type ButtonProps = ButtonAsLink | ButtonAsButton;

/** Polymorphic button — renders an anchor when `href` is provided, else a `<button>`. */
export function Button(props: ButtonProps) {
  const { variant = "primary", size = "md", className, children } = props;
  const classes = cn(base, variants[variant], sizes[size], className);

  if (props.href !== undefined) {
    const { href, variant: _v, size: _s, className: _c, children: _ch, ...rest } =
      props;
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  const { variant: _v, size: _s, className: _c, children: _ch, href: _h, ...rest } =
    props;
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
