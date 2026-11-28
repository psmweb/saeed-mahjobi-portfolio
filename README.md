# Saeed Mahjobi — ONE COMMAND

A single-page bilingual portfolio. English reads left to right. Persian reads right to left in Vazirmatn. Scroll plays a five-act story, from the command hero to the deploy finale.

# سعید محجوبی — ONE COMMAND

پورتفولیوی تک‌صفحه‌ای و دوزبانه. انگلیسی چپ‌به‌راست است و فارسی راست‌به‌چپ، با قلم وزیرمتن. با اسکرول، پنج پرده از معرفی تا استقرار پخش می‌شود.

## Summary

ONE COMMAND is the public portfolio of **Saeed Mahjobi** (`سعید محجوبی`). The page is one Next.js route: an obsidian WebGL stage, a glass HUD, and bilingual copy on a 0–52 second clock. English is the default. The navbar switches to Persian immediately and sets `lang` and `dir`.

The five acts:

1. **Command** — extruded name, command terminal, storyteller gem, and a frameless portrait slot.
2. **Evolution** — 2016, the 2020 archive, and 2026.
3. **Ventures** — six dark-glass slabs: Mikham + Miara, Battery Store, Trader Bot, Honarmarket, Yadaki Yar, and Sandoq-Yar.
4. **Agents** — five PBR robot figurines and a ship-release moment. Every interactive status on this act is labelled `Live simulation · demo` (`شبیه‌سازی زنده · دمو`).
5. **Deploy** — command-center glow, Persian finale, resume downloads, and GitHub.

## Stack

Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4, Three.js, React Three Fiber, Drei, Motion, GSAP, and Lenis.

## Requirements

Node.js 20 or newer and npm 10. No environment variables and no API keys.

## Commands

```bash
npm ci
npm run dev
npm run build && npm run start
```

`npm run dev` starts the Next.js dev server with Turbopack. `npm run build && npm run start` is the production server Lighthouse and the QA scripts use.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server (`next dev --turbopack`) |
| `npm run build` | Production build (`next build --turbopack`) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run check:catalog` | Blocked-pattern scan of source, public files, and docs |

Before a tag, also run `npx tsc --noEmit`. Do not tag a commit whose build, typecheck, lint, or catalog guard fails.

## Folder map

```
src/app/                 shell, fonts, metadata
src/context/             en / fa switch, lang and dir
src/components/scene/    atmosphere, camera, five act meshes
src/components/acts/     scroll landmarks and bilingual overlays
src/components/hud/      glass navbar, battery, build log
src/data/                ventures, agents, timeline, resumes, portraits, i18n
src/lib/                 direction mirror and scroll clock
public/portrait/         frameless cut-out, when the file is supplied
public/resume/           English and Persian resume PDFs
public/textures/ventures six hashed 1024×2304 WebP plates (`npm run optimize:textures`)
public/fonts/            Bebas Neue typeface used by the 3D hero
docs/                    living docs, QA report, pixel reference
scripts/qa/              Playwright capture and draw-call measurement
scripts/check-catalog-guard.mjs
scripts/optimize-textures.mjs   dev-only WebP resize for the venture plates
```

The pixel reference in `docs/reference/` is not imported by the Next.js build.

## Replace the portrait

Put a frameless cut-out at `public/portrait/saeed.png`. The layout checks that path at build time. When the file is present, Act 1 draws it as a soft-edged cut-out in the portrait slot. When it is absent, the slot stays the amber and obsidian glow. Do not add a frame, and do not redraw the face.

`src/data/portraits.ts` still lists the older editorial paths. Those files are not requested while `portraitAssetsReady` is false.

## Edit the content

Copy lives in `src/data/`, not in a `src/content/` directory.

| File | What to edit |
| --- | --- |
| `src/data/i18n/en.ts` | English UI copy |
| `src/data/i18n/fa.ts` | Persian UI copy |
| `src/data/ventures.ts` | Venture facts and metrics |
| `src/data/agents.ts` | The five roles and the demo label |
| `src/data/timeline.ts` | 2016 / 2020 / 2026 marks |
| `src/data/resumes.ts` | Resume URLs |
| `src/data/portraits.ts` | Portrait paths |

Public sentences must stay inside the facts already recorded in `src/data` and `docs/CATALOG.md`. Keep the Act 4 demo label on every interactive agent status. Resume links stay `/resume/Saeed_Mahjobi_Resume_EN.pdf` and `/resume/Saeed_Mahjobi_Resume_FA.pdf`.

## Performance

Act 4 peaks at 145 draw calls and Act 5 at 127, both under 150, measured at 1440×900 with device pixel ratio 1. The canvas caps DPR at 1.75 on desktop and 1.25 below 768px. `prefers-reduced-motion` skips camera smoothing, the arena burst, and the finale beam.

A Lighthouse run on this kind of virtual machine uses software WebGL (SwiftShader). The Performance score then understates a normal GPU. Accessibility, best practices, and SEO for the v1.0.0 check are in `docs/QA_REPORT.md`.

## Deploy

The app is a static Next.js route and is ready for Vercel. Import the repository, use the default Next.js build (`npm run build`), and do not add environment variables. Nothing in the repo is a secret, a token, or a key.

`npm run build && npm run start` serves the same build on any Node host.
