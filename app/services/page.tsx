import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/PageHero";
import { SectionHeading } from "@/components/SectionHeading";
import { ServiceCard } from "@/components/ServiceCard";
import { CaseStudyCard } from "@/components/CaseStudyCard";
import { ProgressBar } from "@/components/ProgressBar";
import { FAQAccordion } from "@/components/FAQAccordion";
import { Reveal } from "@/components/Reveal";
import { Icon, type IconName } from "@/components/Icon";
import { services, caseStudies, skills, faqs, values } from "@/lib/site";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Explore HML Prism's services: web & mobile advertising, display advertising and website development — plus our work, approach, skills and FAQs.",
  openGraph: {
    title: "Services | HML Prism",
    description:
      "Web & mobile advertising, display advertising and website development from HML Prism.",
  },
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Everything you need to grow online"
        description="From paid media to custom-built websites, we deliver end-to-end work that moves the metrics that matter."
      />

      {/* -------------------------------------------------- Intro + value props */}
      <section className="section">
        <div className="container grid items-center gap-12 lg:grid-cols-2">
          <Reveal from="right">
            <div className="overflow-hidden rounded-3xl shadow-lg">
              <Image
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1100&q=80"
                alt="Analytics dashboard showing campaign performance"
                width={1100}
                height={825}
                className="h-full w-full object-cover"
              />
            </div>
          </Reveal>
          <div>
            <SectionHeading
              align="left"
              eyebrow="Our approach"
              title="Strategy first, results always"
              description="We start with your goals and your audience, then build a plan that connects the right message to the right person at the right moment."
            />
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {values.map((value) => (
                <li key={value.title} className="flex items-start gap-3">
                  <Icon
                    name={value.icon as IconName}
                    size={20}
                    className="mt-0.5 shrink-0 text-accent-600"
                  />
                  <div>
                    <p className="font-semibold text-navy">{value.title}</p>
                    <p className="text-sm text-slate-600">{value.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- Service cards */}
      <section className="section bg-slate-50">
        <div className="container">
          <SectionHeading
            eyebrow="What we do"
            title="Core services"
            description="Each service stands on its own — and works even harder when combined."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

      {/* ------------------------------------------------------------ Case studies */}
      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="Our work"
            title="Case studies"
            description="A look at platforms we've designed and built end to end — real products, live in the wild."
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

      {/* ----------------------------------------------------------------- Skills */}
      <section className="section">
        <div className="container grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading
              align="left"
              eyebrow="Our strengths"
              title="Depth across every discipline"
              description="Years of hands-on work across design, development and marketing let us execute end to end — no handoffs, no gaps."
            />
          </div>
          <Reveal from="left" className="space-y-6">
            {skills.map((skill) => (
              <ProgressBar key={skill.label} label={skill.label} value={skill.value} />
            ))}
          </Reveal>
        </div>
      </section>

      {/* -------------------------------------------------------------------- FAQ */}
      <section id="faq" className="section bg-slate-50 scroll-mt-20">
        <div className="container">
          <SectionHeading
            eyebrow="FAQ"
            title="Frequently asked questions"
            description="Everything you might want to know before we get started."
          />
          <div className="mt-12">
            <FAQAccordion items={faqs} />
          </div>
        </div>
      </section>
    </>
  );
}
