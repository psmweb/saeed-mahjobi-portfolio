# AGENTS.md

Onboarding for anyone changing the Saeed Mahjobi portfolio (`ONE COMMAND`). Read this file, then `docs/WORK_CONTRACT.md`, `docs/EXECUTION_PLAN.md`, and `docs/VISUAL_PARITY_SPEC.md`, before editing.

## What this repo is

A Next.js 15 App Router, React 19, TypeScript, Tailwind CSS single page. English is LTR. Persian is RTL (`Vazirmatn`). The current release is **v0.1.0**: governance, living docs, the hero font hook, and verified files. Scene and act visuals are still typed skeletons. Phases 1–5 own the 3D build.

Name on the page: **Saeed Mahjobi** (`سعید محجوبی`). Languages: English (Fluent / Professional) and Persian (Native).

## Architecture

- `src/app/` — shell, fonts, tokens.
- `src/context/LanguageContext.tsx` — instant `en` / `fa` switch. Sets `lang` and `dir`.
- `src/components/scene/` — canvas, camera, atmosphere, storyteller, five figurines. Do not restyle these until Phase 1.
- `src/components/acts/` — five scroll acts. Do not restyle these until Phases 2–5. Act 5 only links the resume PDFs.
- `src/components/hud/` — navbar, battery meter, build log, language toggle.
- `src/data/` — ventures, agents, timeline, resumes, portraits, `i18n/en.ts`, `i18n/fa.ts`.
- `src/lib/direction.ts` — `mirrorX` / `mirrorVector`. Vertical scroll is not reversed.
- `public/resume/` — EN and FA resume PDFs.
- `public/textures/ventures/` — six scrolling UI textures for the later venture stages.
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

1. Hero title font is **Bebas Neue**, weight 400, tracking `0.06em`, via `--font-bebas` and `.font-hero-display`. The class is ready. It is not applied to Act 1 yet.
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
