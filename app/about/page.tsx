import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/PageHero";
import { SectionHeading } from "@/components/SectionHeading";
import { Card } from "@/components/Card";
import { ProgressBar } from "@/components/ProgressBar";
import { Reveal } from "@/components/Reveal";
import { Icon, type IconName } from "@/components/Icon";
import { capabilities, skills } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about HML Prism — a digital marketing agency combining graphics design, app development, digital marketing and brand development to grow your business.",
  openGraph: {
    title: "About | HML Prism",
    description:
      "Meet HML Prism — the team refracting brands into measurable growth.",
  },
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="The team behind the growth"
        description="We are a group of strategists, designers and marketers obsessed with turning your goals into results you can measure."
      />

      {/* ---------------------------------------------------------- Who we are */}
      <section className="section">
        <div className="container grid items-center gap-12 lg:grid-cols-2">
          <Reveal from="right">
            <div className="overflow-hidden rounded-3xl shadow-lg">
              <Image
                src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1100&q=80"
                alt="HML Prism team members working together in the office"
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
              title="Built to make marketing accountable"
              description="HML Prism started with a simple belief: marketing should be measurable. We combine creative craft with rigorous data so every dollar works harder — and you always know exactly what it's doing."
            />
            <p className="mt-4 text-slate-600">
              From your first campaign to your hundredth, we operate as an
              extension of your team — proactive, transparent and relentlessly
              focused on outcomes.
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ Capability cards */}
      <section className="section bg-slate-50">
        <div className="container">
          <SectionHeading
            eyebrow="What we bring"
            title="Capabilities under one roof"
            description="Four disciplines that let us take your brand from idea to impact."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {capabilities.map((cap, i) => (
              <Reveal key={cap.title} delay={i * 0.1}>
                <Card interactive className="h-full text-center">
                  <span className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-accent/10 text-accent-600">
                    <Icon name={cap.icon as IconName} size={26} />
                  </span>
                  <h3 className="text-lg font-bold text-navy">{cap.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {cap.description}
                  </p>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------- Skills */}
      <section className="section">
        <div className="container grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading
              align="left"
              eyebrow="Our strengths"
              title="How we deliver value"
              description="A balanced skill set means we can own the whole journey — strategy, creative, build and optimization."
            />
          </div>
          <Reveal from="left" className="space-y-6 rounded-3xl border border-slate-100 bg-slate-50 p-8 shadow-sm">
            {skills.map((skill) => (
              <ProgressBar key={skill.label} label={skill.label} value={skill.value} />
            ))}
          </Reveal>
        </div>
      </section>
    </>
  );
}
