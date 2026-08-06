import Link from "next/link";
import { Reveal } from "./Reveal";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  /** Breadcrumb current-page label (defaults to the title). */
  crumb?: string;
}

/** Dark navy hero band used at the top of inner pages. */
export function PageHero({ eyebrow, title, description, crumb }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-navy text-white">
      {/* Decorative accent glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-accent/10 blur-3xl"
      />
      <div className="container relative py-16 text-center sm:py-20 lg:py-24">
        <Reveal>
          {eyebrow && (
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-accent">
              {eyebrow}
            </p>
          )}
          <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
            {title}
          </h1>
          {description && (
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-navy-100">
              {description}
            </p>
          )}
          <nav aria-label="Breadcrumb" className="mt-6">
            <ol className="flex items-center justify-center gap-2 text-sm text-navy-100">
              <li>
                <Link href="/" className="hover:text-accent">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-accent">
                {crumb ?? title}
              </li>
            </ol>
          </nav>
        </Reveal>
      </div>
    </section>
  );
}
