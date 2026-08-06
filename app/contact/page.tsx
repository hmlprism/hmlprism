import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { SectionHeading } from "@/components/SectionHeading";
import { Card } from "@/components/Card";
import { ContactForm } from "@/components/ContactForm";
import { Icon } from "@/components/Icon";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with HML Prism. Book a free consultation or send us a message and we'll reply within one business day.",
  openGraph: {
    title: "Contact | HML Prism",
    description: "Reach the HML Prism team and start your digital journey.",
  },
};

const details = [
  {
    icon: "mail" as const,
    label: "Email",
    value: site.email,
    href: `mailto:${site.email}`,
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let's start a conversation"
        description="Tell us about your goals and we'll get back to you within one business day."
      />

      <section className="section">
        <div className="container grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          {/* Contact details */}
          <div>
            <SectionHeading
              align="left"
              eyebrow="Reach us"
              title="Contact details"
              description="Prefer to reach out directly? Use any of the channels below."
            />
            <ul className="mt-8 space-y-5">
              {details.map((d) => (
                <li key={d.label} className="flex items-start gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent-600">
                    <Icon name={d.icon} size={20} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                      {d.label}
                    </p>
                    {d.href ? (
                      <a
                        href={d.href}
                        className="text-navy transition-colors hover:text-accent-600"
                      >
                        {d.value}
                      </a>
                    ) : (
                      <p className="text-navy">{d.value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact form */}
          <Card className="lg:p-8">
            <h2 className="text-xl font-bold text-navy">Send us a message</h2>
            <p className="mb-6 mt-1 text-sm text-slate-600">
              Fields marked with <span className="text-red-500">*</span> are required.
            </p>
            <ContactForm />
          </Card>
        </div>
      </section>
    </>
  );
}
