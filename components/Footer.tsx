import Link from "next/link";
import { Logo } from "./Logo";
import { Icon, type IconName } from "./Icon";
import { services, site, socials, currentYear } from "@/lib/site";

const supportLinks = [
  { label: "Contact", href: "/contact" },
  { label: "Free Consultation", href: "/contact" },
  { label: "FAQ", href: "/services#faq" },
];

const companyLinks = [
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Privacy Policy", href: "/privacy" },
];

/** Site footer with brand blurb, link columns, socials and copyright. */
export function Footer() {
  return (
    <footer className="bg-navy-900 text-navy-100">
      <div className="container grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo variant="light" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-navy-100/80">
            {site.tagline}
          </p>
          <a
            href={`mailto:${site.email}`}
            className="mt-4 inline-block text-sm font-medium text-accent hover:underline"
          >
            {site.email}
          </a>
        </div>

        <nav aria-label="Services">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white">
            Services
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {services.map((s) => (
              <li key={s.slug}>
                <Link
                  href="/services"
                  className="text-navy-100/80 transition-colors hover:text-accent"
                >
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Support">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white">
            Support
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {supportLinks.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className="text-navy-100/80 transition-colors hover:text-accent"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Company">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white">
            Company
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {companyLinks.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className="text-navy-100/80 transition-colors hover:text-accent"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-white/10">
        <div className="container flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
          <p className="text-xs text-navy-100/70">
            © {currentYear} {site.name}. All rights reserved.
          </p>
          <ul className="flex items-center gap-3">
            {socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-accent hover:text-navy-900"
                >
                  <Icon name={s.icon as IconName} size={18} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
