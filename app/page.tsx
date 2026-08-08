import Image from "next/image";
import { Button } from "@/components/Button";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { SectionHeading } from "@/components/SectionHeading";
import { ServiceCard } from "@/components/ServiceCard";
import { CaseStudyCard } from "@/components/CaseStudyCard";
import { StatCounter } from "@/components/StatCounter";
import { Reveal } from "@/components/Reveal";
import { Stagger, StaggerItem } from "@/components/Stagger";
import { Card } from "@/components/Card";
import { Icon, type IconName } from "@/components/Icon";
import { ContactForm } from "@/components/ContactForm";
import { PinnedPrism } from "@/components/PinnedPrism";
import { services, caseStudies, stats, values } from "@/lib/site";

export default function HomePage() {
  return (
    <>
      {/* ============================================================= *
       * Continuous pinned-prism range: Hero → Who we are → Services → *
       * Case Studies share ONE fixed visual (PinnedPrism) anchored on *
       * the right. Each section's content reserves the right column   *
       * via `.pinned-container` (desktop + motion only). Everything    *
       * from Stats onward is outside this wrapper and unaffected.      *
       * ============================================================= */}
      <div id="pinned-range" className="relative">
        <PinnedPrism />

        {/* -------------------------------------------------------------- Hero */}
        <Hero />

        {/* --------------------------------------------------------- Who we are */}
        <section className="section">
          <div className="pinned-container grid items-center gap-12 motion-safe:lg:grid-cols-1 motion-reduce:lg:grid-cols-2">
            <Reveal from="right">
            <div className="overflow-hidden rounded-3xl shadow-lg">
              <Image
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1100&q=80"
                alt="The HML Prism team planning around a table"
                width={1100}
                height={825}
                className="h-full w-full object-cover"
              />
            </div>
          </Reveal>
          <div>
            <SectionHeading
              align="left"
              eyebrow="Who we are"
              title="A growth partner, not just another agency"
              description="We blend performance media, custom website builds and standout creative into one accountable system. Every decision is backed by data, and every result is something you can see."
            />
            <Stagger as="ul" className="mt-6 space-y-3">
              {[
                "Full-funnel strategy across every paid channel",
                "Creative that stops the scroll and drives clicks",
                "Real-time dashboards and honest reporting",
              ].map((item) => (
                <StaggerItem
                  as="li"
                  key={item}
                  className="flex items-start gap-3 text-navy"
                >
                  <Icon name="check" size={20} className="mt-0.5 shrink-0 text-accent" />
                  <span>{item}</span>
                </StaggerItem>
              ))}
            </Stagger>
            <div className="mt-8">
              <Button href="/about" variant="outline">
                Learn more about us
                <Icon name="arrow-right" size={16} />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ Services */}
      <section className="section bg-slate-50">
        <div className="pinned-container">
          <SectionHeading
            eyebrow="What we do"
            title="Services built to grow your business"
            description="From paid campaigns to the websites they point to — capabilities that work together to grow your business online."
          />
          {/* Motion desktop reserves the right column → 2 up (mirroring the beam
              splitting into three strands). Reduced-motion desktop keeps the
              original full-width 3-up grid. */}
          <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 motion-reduce:lg:grid-cols-3">
            {services.map((service) => (
              <StaggerItem key={service.slug} className="h-full">
                <ServiceCard
                  title={service.title}
                  blurb={service.blurb}
                  points={service.points}
                  icon={service.icon as IconName}
                />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

        {/* -------------------------------------------------------- Case studies */}
        <section className="section">
          <div className="pinned-container">
            <SectionHeading
              eyebrow="Our work"
              title="Case studies"
              description="Real platforms we've designed and built — from data-driven web apps to high-traffic content hubs."
            />
            {/* Motion desktop: left-align within the reserved column (the beams
                have reconverged to a single focused point). Reduced-motion
                desktop keeps the original centered max-w-4xl grid. */}
            <Stagger className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-2 motion-safe:lg:mx-0 motion-safe:lg:max-w-none">
              {caseStudies.map((study) => (
                <StaggerItem key={study.url} className="h-full">
                  <CaseStudyCard
                    name={study.name}
                    url={study.url}
                    domain={study.domain}
                    category={study.category}
                    blurb={study.blurb}
                    tags={study.tags}
                    icon={study.icon as IconName}
                  />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      </div>
      {/* ===================== end #pinned-range ===================== */}

      {/* --------------------------------------------------------------- Stats */}
      <section className="bg-navy py-16 sm:py-20">
        <Stagger className="container grid grid-cols-2 gap-8 lg:grid-cols-4" stagger={0.1}>
          {stats.map((stat) => (
            <StaggerItem key={stat.label}>
              <StatCounter
                value={stat.value}
                suffix={stat.suffix}
                label={stat.label}
              />
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* ---------------------------------------------------------- How it works */}
      <HowItWorks />

      {/* -------------------------------------------------------- Why choose us */}
      <section className="section bg-slate-50">
        <div className="container">
          <SectionHeading
            eyebrow="Why choose us"
            title="Marketing you can measure and trust"
          />
          <Stagger className="mt-12 grid gap-6 md:grid-cols-3">
            {values.slice(0, 3).map((value) => (
              <StaggerItem key={value.title} className="h-full">
                <Card interactive className="h-full text-center">
                  <span className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-accent/10 text-accent-600">
                    <Icon name={value.icon as IconName} size={26} />
                  </span>
                  <h3 className="text-lg font-bold text-navy">{value.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {value.description}
                  </p>
                </Card>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ------------------------------------------------------------- Contact */}
      <section id="contact" className="section">
        <div className="container grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading
              align="left"
              eyebrow="Get in touch"
              title="Let's build your next campaign"
              description="Tell us where you want to grow. We'll reply within one business day with a plan to get there."
            />
          </div>
          <Reveal from="left">
            <Card className="lg:p-8">
              <ContactForm />
            </Card>
          </Reveal>
        </div>
      </section>
    </>
  );
}
