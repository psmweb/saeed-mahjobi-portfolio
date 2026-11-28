# Versions

Semantic versions for ONE COMMAND. Tags are annotated. Each tag ships with `CHANGELOG.md` and this file.

| Version | Phase | Scope | Status |
| --- | --- | --- | --- |
| v0.1.0 | 0 | Governance, living docs, hero font hook, resumes, venture textures | Released |
| v0.2.0 | 1 | Obsidian atmosphere, cinema camera, persistent HUD | Released |
| v0.3.0 | 2 | Act 1 hero and Act 2 evolution | Released |
| v0.4.0 | 3A | Venture stages 1–3 (Mikham + Miara, Battery Store, Trader Bot) | Released |
| v0.5.0 | 3B | Venture stages 4–6 (Honarmarket, Yadaki Yar, Sandoq-Yar) | Released |
| v0.6.0 | 4 | Five PBR robot figurines and the arena demo | Released |
| v0.7.0 | 5 | Persian RTL mirror and command-center finale | Released |
| v0.9.0 | 6 | Visual parity, responsive, and performance audit | Released |
| v0.9.1 | 6.1 | Targeted parity: extruded hero, Act 2 archive, Persian type, framing | Released |
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

## v0.6.0

Phase 4. Five agents replace the capsule placeholders.

- `src/components/scene/acts/Act4Arena.tsx` and `act4Robot.ts` — obsidian bodies, brushed heads, iridescent visors, thrusters, and the five role props (frame, server, halo, prism, lens). Geometries and the metal stock are shared. Celebration sparks are one instanced mesh. No shadow maps.
- Roles, in order: Frontend `#38BDF8`, Backend `#10B981`, Executive Manager `#F59E0B`, UI/UX `#A78BFA`, Video `#FB923C`. Labels follow the page language.
- The 34.2s–44s window (internal 18.1–23.5) drives the lineup, the venture beams, the Ship release v0.8 drop, and the shipped face. Pausing on that beat plays it once. Replay plays it again.
- Every ship status carries `Live simulation · demo` (`شبیه‌سازی زنده · دمو`).
- `prefers-reduced-motion` skips the burst and shows the shipped pose immediately once the beat is reached.
- Acts 1–3, the HUD, and Act 5 are unchanged. On aspect below 1, only the arena view pulls back.

## v0.7.0

Phase 5. The 44s–52s window is the command center.

- Golden beam in `Act5FinaleCommandCenter.tsx`, reference internal 23.45–24.15. After internal 23.9 the finale block is `dir=rtl` with the Persian headline and closing line.
- English keeps a Bebas Neue lockup at `0.06em`. Persian uses Vazirmatn.
- `Act5Finale.tsx` reuses the Act 4 robot kit, obsidian metal, and the shared finale origin. The portrait light is frameless. The group stays hidden until internal 23.4, so earlier acts do not draw it.
- Resume links: `/resume/Saeed_Mahjobi_Resume_EN.pdf` and `/resume/Saeed_Mahjobi_Resume_FA.pdf`. GitHub: `https://github.com/psmweb`.
- `prefers-reduced-motion` hides the beam and shows the settled copy, glow, and agents.
- Portrait viewports pull the finale camera back and tighten the agent row. Desktop aspect keeps the reference camera.
- Acts 1–4, the venture slabs, the robot kit, and the HUD are unchanged.

## v0.9.1

Phase 6.1. The v0.9.0 draw-call budget stays in force. Detail is in `docs/QA_REPORT.md`.

- Act 1 English name is extruded Bebas Neue (`Text3D`, `0.06em` tracking): SAEED in chrome, MAHJOBI in amber-gold, scaled to the reference width. The HTML heading remains for accessibility and is the mobile fallback. Persian shows `سعید محجوبی` in Vazirmatn, not as 3D type.
- The dark hero slab is gone. The frameless portrait slot sits at the reference arch pose. `public/portrait/saeed.png`, when present, is a soft-edged cut-out. Otherwise the slot is the glow only.
- The storyteller stays, parked clear of the name and the tagline in both languages and on a phone.
- Act 2 is the reference archive: extruded 2016 with the first-lines plate, extruded 2020 over three archive screens, extruded gold 2026 over the four stack cards. The overlay follows the same beats in EN and FA.
- Persian UI copy uses Vazirmatn. Monospace stays on Latin tokens such as `one-command --deploy --all` and `v0.8`. The Act 5 Persian primary action is `تأیید و استقرار ✓`.
- Act 4 desktop camera eases back so the five cards clear the battery and the nameplates sit above the build log. Mobile nameplates stay inside the gap to their neighbors.
- On a phone, the venture camera pulls back so each slab is framed above the placard and clear of the battery. Desktop Act 3 framing is unchanged.
- Peak draw calls at 1440×900: Act 1 is 32, Act 2 is 18, Act 4 shipped is 145, Act 5 is 127. All under 150.

## v0.9.0

Phase 6. QA, performance, and polish across all five acts. Detail is in `docs/QA_REPORT.md`.

- Act 4 and Act 5 robot kits merge static parts per material and instance pedestals, beams, eyes, thrusters, and chest LEDs. The UI/UX prism no longer uses a transmission pass. Segment counts on the shared kit are lower. Both acts stay under 150 draw calls.
- Canvas DPR is `[1, 1.75]` on desktop and `[1, 1.25]` on viewports under 768px, with Drei `PerformanceMonitor` and `AdaptiveDpr`.
- Act 1 stage, Act 2 group, and zero-opacity nebulae are hidden outside their windows. Act 3, 4, and 5 groups were already gated.
- Battery Store placard chip is `v0.2.0 · 201 PRs` (Persian `v0.2.0 · ۲۰۱ PR`). The slab chip reads `201` / `PULL REQUESTS`.
- English chapter chips match the reference HUD labels. Mobile chips show the number only. Body text and tap targets were tightened. Lenis keeps `syncTouch` off.
- Page title, description, and Open Graph title are `Saeed Mahjobi — ONE COMMAND`.
- Evidence PNGs are in `docs/qa-screenshots/`. `scripts/qa/measure-draws.mjs` and `scripts/qa/capture.mjs` reproduce the draw-call table and the frames.


