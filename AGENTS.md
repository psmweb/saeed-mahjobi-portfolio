# AGENTS.md

Onboarding for anyone changing the Saeed Mahjobi portfolio (`ONE COMMAND`). Read this file, then `docs/WORK_CONTRACT.md`, `docs/EXECUTION_PLAN.md`, and `docs/VISUAL_PARITY_SPEC.md`, before editing.

## What this repo is

A Next.js 15 App Router, React 19, TypeScript, Tailwind CSS single page. English is LTR. Persian is RTL (`Vazirmatn`). The current release is **v0.9.0**: full QA, draw-call pass, and polish on the five-act scene. Act 4 and Act 5 stay under 150 draw calls. Evidence frames live in `docs/qa-screenshots/`.

Name on the page: **Saeed Mahjobi** (`سعید محجوبی`). Languages: English (Fluent / Professional) and Persian (Native).

## Architecture

- `src/app/` — shell, fonts, tokens.
- `src/context/LanguageContext.tsx` — instant `en` / `fa` switch. Sets `lang` and `dir`.
- `src/components/scene/acts/Act1Hero.tsx` — frameless portrait spotlight and the storyteller gem.
- `src/components/scene/acts/Act2Evolution.tsx` — 2016, 2020, and 2026 monoliths.
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
- `public/images/` — portrait slot. Empty until Saeed supplies the frameless studio portrait. Do not generate or redraw a face.
- `docs/reference/onecommand3d_main.js` and `docs/reference/onecommand3d_index.html` — pixel reference only. The Next.js build must not import them.

## Hard rules

- Public copy states only facts that are already in `src/data` or `docs/CATALOG.md`.
- No prices. No secrets, tokens, or keys in the repo.
- The exact blocked patterns (geography, local currency names, a barcode prefix, and one personal name) live only in `scripts/check-catalog-guard.mjs`. Do not retype those patterns into docs, source, or public files. `npm run check:catalog` scans `src/`, `public/`, `docs/`, `AGENTS.md`, `CHANGELOG.md`, `README.md`, and `ARCHITECTURE.md`.
- Any interactive agent task is labeled `Live simulation · demo` (`شبیه‌سازی زنده · دمو`).
- Resume links: `/resume/Saeed_Mahjobi_Resume_EN.pdf` and `/resume/Saeed_Mahjobi_Resume_FA.pdf` (`src/data/resumes.ts`).

## Pixel parity

Match `docs/reference/onecommand3d_main.js` and `docs/reference/onecommand3d_index.html` for camera curves, PBR materials, lighting, the glass HUD, the five-act clock, six venture stages, five robot figurines, and the Persian mirror.

Two approved deviations, already locked:

1. Hero title font is **Bebas Neue**, weight 400, tracking `0.06em`, via `--font-bebas` and `.font-hero-display`. It is applied to the Act 1 English name and the Act 5 English lockup.
2. The portrait is frameless. No arched obsidian-gold frame. Do not alter the face when the file arrives.

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
