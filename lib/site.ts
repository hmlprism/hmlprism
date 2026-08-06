/**
 * Central site configuration for HML Prism.
 * Update brand details, navigation and contact info here — components read
 * from this file so copy changes live in one place.
 */

export const site = {
  name: "HML Prism",
  tagline: "Advertising that refracts your brand into measurable growth.",
  description:
    "HML Prism is a digital marketing and advertising agency helping brands grow through web & mobile advertising, high-impact display campaigns, and custom website development.",
  url: "https://hmlprism.example.com",
  email: "hmlprism@gmail.com",
} as const;

export const nav: { label: string; href: string }[] = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

/**
 * `services` are the concrete, purchasable packages shown as cards on Home,
 * Services and in the Footer. Keep this list in sync with any prose that
 * enumerates what we offer — the FAQ answer below, `site.description` above,
 * and the Services/About page `metadata.description` strings.
 *
 * Note the deliberate distinction from `capabilities` (further down): those are
 * the four broader internal disciplines we lead with on the About page
 * (Graphics Design, App Development, Digital Marketing, Brand Development).
 * We intentionally do NOT force a 1:1 mapping between the two — capabilities
 * describe the craft we bring to every engagement, while services are the
 * specific things a visitor can buy. Digital Marketing covers the two
 * advertising services; App Development covers Website Development; Graphics
 * Design and Brand Development are cross-cutting craft applied within those
 * engagements rather than standalone SKUs. The rule we hold to: no page copy
 * may name a service that has no card here.
 */
export const services: {
  title: string;
  slug: string;
  blurb: string;
  points: string[];
  icon: string;
}[] = [
  {
    title: "Web & Mobile Advertising",
    slug: "web-mobile-advertising",
    blurb:
      "Full-funnel paid campaigns across search, social and in-app inventory — engineered to reach the right audience on every screen.",
    points: ["Search & social ads", "In-app placements", "Retargeting funnels"],
    icon: "monitor",
  },
  {
    title: "Display Advertising",
    slug: "display-advertising",
    blurb:
      "Eye-catching programmatic and native display creative that builds awareness and keeps your brand top of mind.",
    points: ["Programmatic buying", "Native & banner creative", "Brand-safe placements"],
    icon: "layout",
  },
  {
    title: "Website Development",
    slug: "website-development",
    blurb:
      "Custom websites and web apps designed and built to perform — from data-driven platforms to content-rich hubs that turn visitors into customers.",
    points: ["Custom web app design", "Responsive development", "Ongoing maintenance & support"],
    icon: "code",
  },
];

export const caseStudies: {
  name: string;
  url: string;
  domain: string;
  category: string;
  blurb: string;
  tags: string[];
  icon: string;
}[] = [
  {
    name: "Preços Brasil",
    url: "https://precosbrasil.com",
    domain: "precosbrasil.com",
    category: "Data & Analytics",
    blurb:
      "A cost-of-living platform that turns official IBGE and Central Bank data into clear, searchable pricing across 127+ everyday items — with regional filters, historical trends and multi-currency views.",
    tags: ["Web app", "Data visualization", "SEO"],
    icon: "chart",
  },
  {
    name: "Brasileirão Total",
    url: "https://brasileiraototal.com",
    domain: "brasileiraototal.com",
    category: "Sports Media",
    blurb:
      "A real-time hub for Brazilian and South American football — live news, league tables, fixtures and dedicated club pages, all in one fast, centralized experience fans keep coming back to.",
    tags: ["Content platform", "Live data", "SEO"],
    icon: "spark",
  },
];

export const stats: { label: string; value: number; suffix: string }[] = [
  { label: "Boost in Traffic", value: 180, suffix: "%" },
  { label: "Conversion Rate", value: 62, suffix: "%" },
  { label: "Sales Increase", value: 240, suffix: "%" },
  { label: "Happy Clients", value: 320, suffix: "+" },
];

export const steps: { title: string; description: string }[] = [
  {
    title: "Free Consultation",
    description:
      "We learn your goals, audit your current marketing and map the fastest path to growth — no strings attached.",
  },
  {
    title: "Choose Package",
    description:
      "Pick a tailored plan that fits your budget and objectives, with clear deliverables and transparent pricing.",
  },
  {
    title: "Launch & Optimize",
    description:
      "We launch your campaigns, track performance in real time and refine relentlessly to maximize your return.",
  },
];

export const faqs: { question: string; answer: string }[] = [
  {
    question: "What services does HML Prism offer?",
    answer:
      "We provide web & mobile advertising, display advertising and website development — plus the strategy, creative and analytics that tie every campaign and build together.",
  },
  {
    question: "How does your process work?",
    answer:
      "It starts with a free consultation, followed by a tailored package, then campaign launch. From there we monitor performance and optimize continuously.",
  },
  {
    question: "Can campaigns be customized to my business?",
    answer:
      "Absolutely. Every engagement begins with your goals and audience. We build bespoke strategies rather than forcing your brand into a template.",
  },
  {
    question: "How much experience does your team have?",
    answer:
      "Our specialists have run campaigns across e-commerce, SaaS, local services and more, managing budgets from startup-scale to enterprise.",
  },
  {
    question: "What makes HML Prism different?",
    answer:
      "We combine data-driven media buying with sharp creative and radical transparency — you always know what we are doing and why it works.",
  },
  {
    question: "How do I get started?",
    answer:
      "Book your free consultation through the contact form. We will reply within one business day to schedule a call and outline next steps.",
  },
];

export const values: { title: string; description: string; icon: string }[] = [
  {
    title: "Tailored Solutions",
    description: "Strategies built around your goals — never off-the-shelf.",
    icon: "target",
  },
  {
    title: "Client-Centric Approach",
    description: "Your success is our metric. We work as an extension of your team.",
    icon: "users",
  },
  {
    title: "Innovation-Driven",
    description: "We test emerging channels and tactics so you stay ahead.",
    icon: "spark",
  },
  {
    title: "Transparent Reporting",
    description: "Clear dashboards and honest numbers on every campaign.",
    icon: "chart",
  },
];

export const skills: { label: string; value: number }[] = [
  { label: "Design", value: 92 },
  { label: "App Development", value: 85 },
  { label: "Digital Marketing", value: 96 },
  { label: "Content Creation", value: 88 },
];

export const capabilities: { title: string; description: string; icon: string }[] = [
  {
    title: "Graphics Design",
    description: "Scroll-stopping visuals and ad creative that reflect your brand.",
    icon: "layout",
  },
  {
    title: "App Development",
    description: "Fast, reliable mobile and web experiences that convert.",
    icon: "monitor",
  },
  {
    title: "Digital Marketing",
    description: "Performance campaigns across every channel that matters.",
    icon: "spark",
  },
  {
    title: "Brand Development",
    description: "Positioning and identity that make your brand unmistakable.",
    icon: "target",
  },
];

export const currentYear = new Date().getFullYear();
