# Versions

Semantic versions for ONE COMMAND. Tags are annotated. Each tag ships with `CHANGELOG.md` and this file.

| Version | Phase | Scope | Status |
| --- | --- | --- | --- |
| v0.1.0 | 0 | Governance, living docs, hero font hook, resumes, venture textures | Released |
| v0.2.0 | 1 | Obsidian atmosphere, cinema camera, persistent HUD | Released |
| v0.3.0 | 2 | Act 1 hero and Act 2 evolution | Released |
| v0.4.0 | 3A | Venture stages 1–3 (Mikham + Miara, Battery Store, Trader Bot) | Released |
| v0.5.0 | 3B | Venture stages 4–6 (Honarmarket, Yadaki Yar, Sandoq-Yar) | Released |
| v0.6.0 | 4 | Five PBR robot figurines and the arena demo | Not started |
| v0.7.0 | 5 | Persian RTL mirror and command-center finale | Not started |
| v0.9.0 | 6 | Visual parity, responsive, and performance audit | Not started |
| v1.0.0 | 7 | Production release | Not started |

After v1.0.0: `v1.0.x` fixes copy or visuals, `v1.x.0` adds a venture or feature, `v2.0.0` is a redesign.

## v0.1.0

- `AGENTS.md`, `docs/WORK_CONTRACT.md`, `docs/EXECUTION_PLAN.md`, `docs/CATALOG.md`, `docs/VISUAL_PARITY_SPEC.md`, `CHANGELOG.md`.
- Reference scene kept at `docs/reference/` and not imported by Next.js.
- Bebas Neue hooked as `--font-bebas` and `.font-hero-display` (`0.06em`). Not applied to Act 1 yet.
- Resumes and six venture textures copied into `public/`.
- Portrait file is not in the repo. The frameless rule is locked; the pixels are not.

## v0.2.0

- Exponential obsidian fog, seeded starfield, scroll-driven nebula clouds, dot-grid floors, hemisphere fill, key light, and arena rim lights.
- ACES Filmic tone mapping and a room environment on the canvas.
- Lenis scroll progress drives the reference camera: weighted position, trailing look-at, venture dolly, and FOV breathing. Reduced motion drops the smoothing and roll.
- Glass navbar, vertical battery (mirrored in RTL), and a single-line build log in EN and FA.

## v0.3.0

- Act 1: Bebas Neue name, Vazirmatn Persian name, command terminal, frameless portrait slot, storyteller gem.
- Act 2: 2016, 2020, and 2026 monoliths, studio mark, and floor beams.

## v0.4.0

Phase 3A. Ventures 4–6 stay placeholders.

- `src/components/scene/acts/Act3Ventures.tsx` — obsidian slabs, specular rim, scrolling `mikham.png`, `battery-store.png`, and `trader-bot.png`. Battery cells use emerald and amber. Trader Bot adds a cyan and emerald wireframe. Stages 4–6 are unlabeled glass so the camera path stays continuous.
- `src/components/acts/Act3VentureOverlay.tsx` — bilingual placards on the reference venture clock. Persian sits on the start edge.
- `src/components/acts/Act3VentureStage.tsx` — scroll landmark only. The visible copy is the overlay.
- Metrics on the placards: `400K+` businesses, `v0.2.0 · PR #201`, `~50K LOC · 886/886 CI tests`, live trading off.
- `public/textures/ventures/battery-store.png` and `trader-bot.png` were swapped on disk. v0.4.0 puts each UI under its own filename.

## v0.5.0

Phase 3B. The quiet glass for ventures 4–6 is now the real stages.

- Honarmarket, Yadaki Yar, and Sandoq-Yar reuse the v0.4.0 slab, sheen, chip, and placard timing.
- Textures `honarmarket.png`, `yadaki-yar.png`, and `sandoq-yar.png` already matched those products. No filename swap.
- Placards: `1,450+` designs; `v0.7.0 · FastAPI + PostgreSQL · 80 PRs`; offline barcode POS with `0 123456 789012`.
- Sandoq-Yar also carries the Xchange and Rap Historical badges.
- Persian copy sits on the start edge. Chip positions flip with `dir`.


