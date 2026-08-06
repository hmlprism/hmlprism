"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { Button } from "./Button";
import { Icon } from "./Icon";
import { nav } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Sticky site header with desktop nav and an accessible mobile menu. */
export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Add a subtle shadow/background once the page is scrolled.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-colors",
        scrolled
          ? "border-slate-200 bg-white/90 backdrop-blur"
          : "border-transparent bg-white",
      )}
    >
      <div className="container flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "text-sm font-medium transition-colors hover:text-accent-600",
                isActive(item.href) ? "text-accent-600" : "text-navy",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button href="/contact" variant="accent" size="sm">
            Get Started
          </Button>
        </div>

        <button
          type="button"
          className="rounded p-2 text-navy transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <Icon name={open ? "close" : "menu"} size={24} />
        </button>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={cn(
          "overflow-hidden border-t border-slate-100 bg-white md:hidden",
          open ? "block" : "hidden",
        )}
      >
        <nav aria-label="Mobile" className="container flex flex-col gap-1 py-4">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "bg-accent/10 text-accent-600"
                  : "text-navy hover:bg-slate-50",
              )}
            >
              {item.label}
            </Link>
          ))}
          <Button href="/contact" variant="accent" size="md" className="mt-2">
            Get Started
          </Button>
        </nav>
      </div>
    </header>
  );
}
