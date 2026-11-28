# AGENTS.md

Onboarding for anyone changing the Saeed Mahjobi portfolio (`ONE COMMAND`). Read this file, then `docs/WORK_CONTRACT.md`, `docs/EXECUTION_PLAN.md`, and `docs/VISUAL_PARITY_SPEC.md`, before editing.

## What this repo is

A Next.js 15 App Router, React 19, TypeScript, Tailwind CSS single page. English is LTR. Persian is RTL (`Vazirmatn`). Name on the page: **Saeed Mahjobi** (`سعید محجوبی`). Languages: English (Fluent / Professional) and Persian (Native).

## Live status

**v1.0.0 released.** The shipped scene is the approved v0.9.2 visual build: Act 2 archive screens and year scale, plus the Act 4 shipped spacing. No visual, copy, or layout change landed in v1.0.0. Act 4 peaks at 145 draw calls and Act 5 at 127. Both stay under 150. Evidence frames live in `docs/qa-screenshots/`. The release check, including Lighthouse, is in `docs/QA_REPORT.md`.

## Architecture and file map

- `src/app/` — shell, fonts, tokens.
- `src/context/LanguageContext.tsx` — instant `en` / `fa` switch. Sets `lang` and `dir`.
- `src/components/scene/acts/Act1Hero.tsx` — extruded Bebas Neue name, frameless portrait slot, and the storyteller gem.
- `src/components/scene/acts/Act2Evolution.tsx` — extruded 2016, 2020, and 2026 with the archive screens and the 2026 stack.
- `src/components/scene/acts/Act3Ventures.tsx` — six dark-glass venture slabs with scrolling UI textures.
- `src/components/scene/acts/Act4Arena.tsx` — five PBR robot figurines, role labels, and the ship-release cube.
- `src/components/scene/acts/Act5Finale.tsx` — command-center glow, frameless portrait light, gold stage, and the five agents at rest.
- `src/components/acts/Act1HeroOverlay.tsx`, `Act2EvolutionOverlay.tsx`, `Act3VentureOverlay.tsx`, `Act4AgentArena.tsx`, and `Act5FinaleCommandCenter.tsx` — bilingual copy synced to the 0–52s clock. Act 4 also carries the replay control. Act 5 carries the wipe, the Persian finale, and the resume and GitHub controls.
- `src/components/scene/` — atmosphere, camera, Act 1 gem, Act 2 monoliths, Act 3 slabs, Act 4 arena, Act 5 finale.
- `src/components/acts/` — scroll landmarks plus Act 1–5 overlays.
- `src/components/hud/` — glass navbar (`SM`, chapter chips, `EN | فارسی`), battery meter, one-line build log.
- `src/data/` — ventures, agents, timeline, resumes, portraits, `i18n/en.ts`, `i18n/fa.ts`.
- `src/lib/direction.ts` — `mirrorX` / `mirrorVector`. Vertical scroll is not reversed.
- `public/resume/` — EN and FA resume PDFs.
- `public/textures/ventures/` — six scrolling UI textures, one per venture stage.
- `public/portrait/saeed.png` — frameless studio portrait. Absent until Saeed supplies it. If the file is there, Act 1 draws it as a soft-edged cut-out. If it is not, the slot is the amber/obsidian glow only. Do not generate or redraw a face.
- `docs/reference/onecommand3d_main.js` and `docs/reference/onecommand3d_index.html` — pixel reference only. The Next.js build must not import them.

## Hard rules

- Public copy states only facts that are already in `src/data` or `docs/CATALOG.md`.
- No prices. No secrets, tokens, or keys in the repo.
- The exact blocked patterns (geography, local currency names, a barcode prefix, and one personal name) live only in `scripts/check-catalog-guard.mjs`. Do not retype those patterns into docs, source, or public files. `npm run check:catalog` scans `src/`, `public/`, `docs/`, `AGENTS.md`, `CHANGELOG.md`, `README.md`, and `ARCHITECTURE.md`.
- Any interactive agent task is labeled `Live simulation · demo` (`شبیه‌سازی زنده · دمو`).
- Resume links: `/resume/Saeed_Mahjobi_Resume_EN.pdf` and `/resume/Saeed_Mahjobi_Resume_FA.pdf` (`src/data/resumes.ts`).

## Pixel parity

Match `docs/reference/onecommand3d_main.js` and `docs/reference/onecommand3d_index.html` for camera curves, PBR materials, lighting, the glass HUD, the five-act clock, six venture stages, five robot figurines, and the Persian mirror.

## Known deviations

1. Hero title font is **Bebas Neue**, weight 400, tracking `0.06em`, by owner choice. English Act 1 is a 3D extrusion (`public/fonts/bebas-neue.json`, drei `Text3D`). The HTML `h1` stays for accessibility, visually hidden on desktop and shown on small screens. Persian Act 1 is HTML Vazirmatn, not 3D. Act 5 English lockup stays Bebas Neue.
2. The portrait is frameless and still waiting for the owner's photo. No arched obsidian-gold frame. The slot sits where the reference arch sits. The file, when it arrives, is `public/portrait/saeed.png`, a frameless cut-out. Do not alter the face.
3. Venture and ship statuses are labelled `Live simulation · demo` (`شبیه‌سازی زنده · دمو`).

## SemVer

Annotated tags only: `v0.1.0`, `v0.2.0`, … `v1.0.0`. Every tag updates `CHANGELOG.md` and `docs/VERSIONS.md` in the same commit. `v1.0.x` is a fix, `v1.x.0` is a new venture or feature, `v2.0.0` is a redesign. Do not tag a commit whose build, typecheck, lint, or catalog guard fails.

The roadmap is in `docs/VERSIONS.md` and `docs/EXECUTION_PLAN.md`.

## Verify

```bash
npm run build
npx tsc --noEmit
npm run lint
npm run check:catalog
```

## Work contract

Small tasks, one fresh agent each, a self-contained brief, and no work outside the brief. Major stages wait for Saeed’s explicit go-ahead. Details: `docs/WORK_CONTRACT.md`.
