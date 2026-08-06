import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${site.name} collects, uses and protects your information.`,
};

export default function PrivacyPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Privacy Policy" crumb="Privacy Policy" />
      <section className="section">
        <div className="container prose prose-slate mx-auto max-w-3xl">
          <div className="space-y-6 text-slate-600">
            <p>
              This is a placeholder privacy policy for {site.name}. Replace this
              copy with your finalized legal language before launch.
            </p>
            <div>
              <h2 className="text-xl font-bold text-navy">Information we collect</h2>
              <p className="mt-2">
                When you submit our contact form we collect the name, email,
                phone number, subject and message you provide, solely to respond
                to your enquiry.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-navy">How we use it</h2>
              <p className="mt-2">
                We use your details to reply to you and to discuss potential
                services. We do not sell your personal information.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-navy">Contact</h2>
              <p className="mt-2">
                Questions about this policy? Email us at{" "}
                <a
                  href={`mailto:${site.email}`}
                  className="font-medium text-accent-600 hover:underline"
                >
                  {site.email}
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
