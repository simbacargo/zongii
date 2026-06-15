# Zongii — Website V2

Marketing site for **Zongii Mining Co. Ltd** (Tanzania mining, building & construction supplies).
A rebuild of the V1 Vite site (`../website`) — more expressive, glassy/editorial, fully bilingual.

## Stack

- **Next.js 16** (App Router, React 19, Turbopack)
- **Tailwind CSS v4** — "Deep Sea Gold" design system (`app/globals.css`)
- **GSAP + ScrollTrigger** via `@gsap/react` `useGSAP()` — scroll storytelling, pinned horizontal industries, parallax, count-ups
- **Framer Motion** (`motion`) — page transitions, nav, hovers, filter layout animation, form states
- **shadcn/ui + Base UI** — accessible primitives (Sheet, Input, etc.)
- **next-intl** — `[locale]` routing for **English (`/en`)** and **Swahili (`/sw`)** with hreflang
- **next-themes** — dark (default) / light
- **zod** — contact form validation (client + API)
- **Resend** — optional contact email delivery

## Develop

```bash
bun install
bun run dev      # http://localhost:3000  → redirects to /en
bun run build    # production build
bun run start
```

## Content & i18n

- Canonical English catalog data lives in `lib/content.ts` (ported from V1).
- UI chrome + section copy: `messages/en.json`, `messages/sw.json`.
- Swahili catalog overlay (product/industry/value/news short strings): `lib/content-sw.ts`,
  merged by `lib/catalog.ts` with English fallback.
- **Long-form news article bodies are English-only** for now (flagged in the UI when viewing
  in Swahili). Add Swahili bodies by extending the data model when professional translations exist.

## Environment

Copy `.env.example` → `.env.local` and set what you need (all optional):

| Variable | Purpose |
| --- | --- |
| `RESEND_API_KEY` | Enables contact-form email delivery via Resend. Without it, enquiries are validated and logged server-side (form still shows success). |
| `CONTACT_TO` | Recipient address (default: `sales@zongii.co.tz`). |
| `CONTACT_FROM` | Verified Resend sender (default: Resend sandbox sender). |
| `NEXT_PUBLIC_GA_ID` | Google Analytics measurement ID. Analytics is a no-op when unset. |

## SEO

`app/sitemap.ts`, `app/robots.ts`, per-route `metadata` with hreflang `alternates`,
dynamic OG image (`app/[locale]/opengraph-image.tsx`), and `Store` JSON-LD (`components/json-ld.tsx`).

## Notes

- Display font **Clash Display** is self-hosted (`public/fonts`, Fontshare). Body **Inter** +
  editorial serif **Playfair Display** via `next/font/google`.
- Product images are loaded remotely from `zongii.co.tz` (configured in `next.config.ts`) with a
  graceful in-card fallback.
