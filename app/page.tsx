import Image from "next/image";
import { Button } from "@/components/Button";
import { SectionHeading } from "@/components/SectionHeading";
import { ServiceCard } from "@/components/ServiceCard";
import { CaseStudyCard } from "@/components/CaseStudyCard";
import { StatCounter } from "@/components/StatCounter";
import { Reveal } from "@/components/Reveal";
import { Card } from "@/components/Card";
import { Icon, type IconName } from "@/components/Icon";
import { ContactForm } from "@/components/ContactForm";
import { services, caseStudies, stats, steps, values } from "@/lib/site";

export default function HomePage() {
  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden bg-navy text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -top-24 h-96 w-96 rounded-full bg-accent/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-accent/10 blur-3xl"
        />
        <div className="container relative grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
          <Reveal>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-accent">
              Digital Marketing & Advertising
            </p>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Refract your brand into{" "}
              <span className="text-accent">measurable growth</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-navy-100">
              HML Prism runs data-driven web, mobile and messaging campaigns that
              turn attention into revenue — with sharp creative and radically
              transparent reporting.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button href="/contact" variant="accent" size="lg">
                Get Started
                <Icon name="arrow-right" size={18} />
              </Button>
              <Button
                href="/contact"
                size="lg"
                className="border border-white/30 text-white hover:border-accent hover:text-accent"
              >
                Free Consultation
              </Button>
            </div>
          </Reveal>

          <Reveal from="left" delay={0.15}>
            <div className="relative mx-auto max-w-md">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 rounded-[2.5rem] bg-accent/20 blur-3xl"
              />
              <div className="flex flex-col items-center gap-6 rounded-[2.5rem] border border-white/10 bg-white/5 p-10 shadow-2xl backdrop-blur-sm sm:p-14">
                <Image
                  src="/logo.svg"
                  alt="HML Prism logo — a prism refracting light into a full spectrum"
                  width={320}
                  height={320}
                  className="h-auto w-56 drop-shadow-[0_12px_40px_rgba(46,196,182,0.35)] sm:w-64"
                  priority
                />
                <p className="text-center text-2xl font-bold tracking-tight text-white">
                  HML <span className="text-accent">Prism</span>
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* --------------------------------------------------------- Who we are */}
      <section className="section">
        <div className="container grid items-center gap-12 lg:grid-cols-2">
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
              description="We blend performance media, lifecycle messaging and standout creative into one accountable system. Every decision is backed by data, and every result is something you can see."
            />
            <ul className="mt-6 space-y-3">
              {[
                "Full-funnel strategy across every paid channel",
                "Creative that stops the scroll and drives clicks",
                "Real-time dashboards and honest reporting",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-navy">
                  <Icon name="check" size={20} className="mt-0.5 shrink-0 text-accent" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
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
        <div className="container">
          <SectionHeading
            eyebrow="What we do"
            title="Services built to grow your business"
            description="Core capabilities that work together to reach your audience wherever they are."
          />
          <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-2">
            {services.map((service, i) => (
              <Reveal key={service.slug} delay={i * 0.1}>
                <ServiceCard
                  title={service.title}
                  blurb={service.blurb}
                  points={service.points}
                  icon={service.icon as IconName}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- Case studies */}
      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="Our work"
            title="Case studies"
            description="Real platforms we've designed and built — from data-driven web apps to high-traffic content hubs."
          />
          <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-2">
            {caseStudies.map((study, i) => (
              <Reveal key={study.url} delay={i * 0.1}>
                <CaseStudyCard
                  name={study.name}
                  url={study.url}
                  domain={study.domain}
                  category={study.category}
                  blurb={study.blurb}
                  tags={study.tags}
                  icon={study.icon as IconName}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------- Stats */}
      <section className="bg-navy py-16 sm:py-20">
        <div className="container grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatCounter
              key={stat.label}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
            />
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------- How it works */}
      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="How it works"
            title="Three steps to launch"
            description="A simple, transparent path from first conversation to live campaigns."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((step, i) => (
              <Reveal key={step.title} delay={i * 0.1}>
                <Card className="h-full">
                  <span className="mb-4 grid h-11 w-11 place-items-center rounded-full bg-navy text-lg font-bold text-white">
                    {i + 1}
                  </span>
                  <h3 className="text-lg font-bold text-navy">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {step.description}
                  </p>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- Why choose us */}
      <section className="section bg-slate-50">
        <div className="container">
          <SectionHeading
            eyebrow="Why choose us"
            title="Marketing you can measure and trust"
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {values.slice(0, 3).map((value, i) => (
              <Reveal key={value.title} delay={i * 0.1}>
                <Card interactive className="h-full text-center">
                  <span className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-accent/10 text-accent-600">
                    <Icon name={value.icon as IconName} size={26} />
                  </span>
                  <h3 className="text-lg font-bold text-navy">{value.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {value.description}
                  </p>
                </Card>
              </Reveal>
            ))}
          </div>
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
          <Card className="lg:p-8">
            <ContactForm />
          </Card>
        </div>
      </section>
    </>
  );
}
