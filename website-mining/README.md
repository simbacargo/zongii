# Zongii Mining — Showcase Site

Premium marketing site for **Zongii Mining Co. Ltd** (Mwanza, Tanzania, est. 2002),
built around a "strata" concept: the page descends like a geological section, dark basalt and
light bone layers alternating, with a fixed depth meter tracking scroll as metres underground.

Routes (react-router): `/` immersive home · `/catalog` full stock list with search ·
`/catalog/:categoryId` category grid · `/catalog/:categoryId/:itemId` deep-linkable item
dialog (no prices — every item has a "Request price" mailto with the item name as subject).

## Stack

- **Vite + React 19 + TypeScript**
- **Tailwind CSS v4** (theme tokens in `src/index.css`)
- **React Three Fiber + three.js** — two procedural WebGL set pieces:
  - `src/three/OreScene.tsx` — hero: fbm-displaced gold-ore boulder with vein colouring + gold dust particles
  - `src/three/PitScene.tsx` — generated terraced open-pit with scroll-driven camera descent
- **GSAP + ScrollTrigger** — split-text reveals, pinned horizontal equipment rail, parallax, counters
- **Lenis** — smooth scrolling (synced to ScrollTrigger)

## Design tokens

Basalt `#0C0A07` · Strata `#17130E` · Bone `#EDE6D8` · Gold `#E0A83E` · Ash `#8A8177`
Type: Cabinet Grotesk (display) · Supreme (body) · JetBrains Mono (specs/coordinates).

## Commands

```sh
bun install
bun run dev       # dev server
bun run build     # type-check + production build
bun run preview   # serve dist/
bun .shots/snap.mjs [--mobile] [--catalog]   # scroll-through screenshots via snap chromium
python3 scripts/extract-catalog.py           # regenerate catalog from ../MINING LIST 2.xlsx
```

Content (real specs from the company stock list, contact details, goldfield names) lives in
`src/lib/data.ts`. The full product catalog (`src/lib/catalog.json` + `public/images/products/`,
317 items / 303 photos) is generated from `MINING LIST 2.xlsx` at the repo root by
`scripts/extract-catalog.py` — rerun it when the stock list changes; item names and size
variants are kept verbatim from the sheet. Photography in `public/images` is Unsplash
(free tier, no watermarks); product photos are the company's own, embedded in the workbook.

Reduced motion is honoured throughout (no smooth scroll, no split reveals, static 3D).
Custom cursor and magnetic buttons are desktop-only.
