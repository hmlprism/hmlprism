# /public assets

Drop your brand files here:

- `logo.svg` (preferred) or `logo.png` — your HML Prism logo.
- `og-image.png` — 1200×630 social share image (optional).

## Wiring up the real logo

The header and footer currently render a text wordmark placeholder in
`components/Logo.tsx`. Once your logo file is in this folder, replace the
wordmark block with a next/image, e.g.:

```tsx
import Image from "next/image";

<Image src="/logo.svg" alt="HML Prism" width={140} height={36} priority />
```

Keep the `<Link href="/">` wrapper so the logo stays clickable.
