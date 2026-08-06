# HML Prism — Marketing Website

Marketing site for **HML Prism**, a digital marketing & advertising agency
(web & mobile advertising, SMS & email marketing, display advertising).

Built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and
**Framer Motion**.

## Tech stack

- Next.js 14 (App Router, Server Components)
- TypeScript (strict)
- Tailwind CSS 3 with custom brand tokens
- Framer Motion for scroll reveals & stat counters
- `next/font` (Manrope) and `next/image`

## Getting started

```bash
npm install      # install dependencies
npm run dev      # start dev server at http://localhost:3000
npm run build    # production build
npm run start    # serve the production build
npm run lint     # run ESLint
```

## Project structure

```
app/
  layout.tsx          Root layout: fonts, metadata, header/footer, skip link
  globals.css         Tailwind layers + base styles
  page.tsx            Home
  services/page.tsx   Services
  about/page.tsx      About
  contact/page.tsx    Contact
  privacy/page.tsx    Privacy Policy (placeholder)
  api/contact/route.ts  Contact form endpoint (logs submissions)
components/            Reusable UI (Button, Card, SectionHeading, StatCounter,
                      FAQAccordion, ContactForm, Header, Footer, etc.)
lib/
  site.ts             Brand info, nav, services, stats, FAQs, etc. (edit here)
  utils.ts            Small helpers (cn)
public/               Static assets — drop your logo here (see public/README.md)
```

## Brand tokens

Defined in `tailwind.config.ts`:

- **Navy** (primary): `#0D2F4A` → `bg-navy`, `text-navy`
- **Accent** (cyan/teal): `#2EC4B6` → `bg-accent`, `text-accent`

## Where to update content

- **Business details** (name, email, tagline): `lib/site.ts`.
  - The primary contact email is **hmlprism@gmail.com**.
  - Contact is email-only (no phone/office). To add them back, restore the
    fields in `lib/site.ts` and the `details` list in `app/contact/page.tsx`.
- **Navigation, services, stats, steps, FAQs, values, skills**: `lib/site.ts`.
- **Social links**: the `socials` array in `lib/site.ts`.

## Adding your logo

The header/footer use a styled text wordmark placeholder. To use a real logo,
add `logo.svg` (or `logo.png`) to `/public` and swap the wordmark in
`components/Logo.tsx` for a `next/image` — see `public/README.md` for the
snippet.

## Contact form / email delivery

The form posts to `app/api/contact/route.ts`, which validates the payload and
**logs submissions to the server console**. To enable real email delivery, plug
an email provider (Resend, SendGrid, Nodemailer, …) into the marked section of
that route and send to `site.email`.

## Images

Section imagery uses Unsplash URLs via `next/image` as **temporary
placeholders** (allowed host configured in `next.config.mjs`). Replace them with
your own photography and update the `remotePatterns` / `src` values as needed.

## Notes

- Fully responsive across mobile, tablet and desktop breakpoints.
- Per-page SEO metadata + Open Graph tags; semantic HTML and a skip link.
- Accessible: alt text, ARIA labels, visible focus states, keyboard-friendly
  menu and accordion; animations respect `prefers-reduced-motion`.
