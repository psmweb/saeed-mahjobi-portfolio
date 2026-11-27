# Saeed Mahjobi — ONE COMMAND

Bilingual (English / Persian) portfolio SPA for Saeed Mahjobi. This repository is the compiling scaffold: dark obsidian stage, amber-gold accents, five humanoid agent rigs, and verified catalog data. Scroll-linked character animation waits for the approved video mockup.

## Stack

Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Three.js, React Three Fiber, Drei, Motion, GSAP, Lenis, and Lucide.

## Commands

```bash
npm install
npm run dev
npm run build
npx tsc --noEmit
npm run check:catalog
```

`npm run dev` starts the Next.js dev server. Pass a port when you need one, for example `npm run dev -- -p 43123`.

## Language

The navbar toggle switches `EN (LTR)` and `FA (RTL)` immediately. Persian uses Vazirmatn. Horizontal motion flips with direction. Vertical scroll does not reverse.

## Catalog

Product copy in `src/data` uses only verified catalog figures: six active products, Xchange, Rap Historical, and the 2020 archive. See `ARCHITECTURE.md` for the folder map, the five-act scroll plan, and the content rules.

Portrait files belong in `public/images/`:

- `saeed_editorial_portrait.png`
- `saeed_cutout_clean.png`
