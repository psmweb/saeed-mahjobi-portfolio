# Versions

Semantic versions for ONE COMMAND. Tags are annotated. Each tag ships with `CHANGELOG.md` and this file.

Dates and commits are taken from `git log` and the annotated tags. v0.1.0–v0.3.0 were tagged on `main` and have no pull request. v0.4.0–v0.9.2 landed through pull requests #1–#7. The commit column is the merge commit for those pull requests, and the tagged commit when there was no merge. v1.0.0 is pull request #8. Its merge commit does not exist until that pull request merges. The commit shown for v1.0.0 is the annotated tag.

| Version | Date | PR | Commit | Highlights |
| --- | --- | --- | --- | --- |
| v0.1.0 | 2026-11-27 22:03:43 +0000 | — | `b490f7cb11ffc556a75a9ae4a6185d6a9fe9bde9` | Governance, living docs, hero font hook, resumes, venture textures |
| v0.2.0 | 2026-11-27 22:17:48 +0000 | — | `247a990ba0b08362030fd062550bfe4849c066de` | Obsidian atmosphere, cinema camera, persistent HUD |
| v0.3.0 | 2026-11-27 22:33:40 +0000 | — | `1cd8591406c451c1acff4265d513588a6a08e4c5` | Act 1 hero and Act 2 evolution |
| v0.4.0 | 2026-11-28 02:25:08 +0330 | #1 | `3a1415473910fbeb7b6a8c96ba3ff367f8388a23` | Venture stages 1–3: Mikham + Miara, Battery Store, Trader Bot |
| v0.5.0 | 2026-11-28 02:46:19 +0330 | #2 | `2c3a2cb5a25762cd7940a6b2a99bf1fd8cc9ad16` | Venture stages 4–6: Honarmarket, Yadaki Yar, Sandoq-Yar |
| v0.6.0 | 2026-11-28 03:15:01 +0330 | #3 | `3dce7a4be7abfa5f883c3cdf9c372d79a28e680c` | Five PBR robot figurines and the arena demo |
| v0.7.0 | 2026-11-28 03:35:07 +0330 | #4 | `92781238882817cacd46d5c6549ce56c5cfca186` | Persian RTL mirror and command-center finale |
| v0.9.0 | 2026-11-28 04:03:06 +0330 | #5 | `f39718bb82fdbc46b94432f9109f338f47058d27` | Visual parity, responsive, and performance audit |
| v0.9.1 | 2026-11-28 04:32:25 +0330 | #6 | `4f28afd4498f9350a7afc560ebf2465610c04f45` | Extruded hero, Act 2 archive, Persian type, framing |
| v0.9.2 | 2026-11-28 05:02:07 +0330 | #7 | `dbbb26908aab8496a96242b2f00e92b3253cb221` | Act 2 screen mockups and year scale, Act 4 shipped spacing |
| v1.0.0 | 2026-11-28 | #8 | tag `v1.0.0` | Production release: docs, verification, no visual change |

After v1.0.0: `v1.0.x` fixes copy or visuals, `v1.x.0` adds a venture or feature, `v2.0.0` is a redesign.

## v1.1.0

Not tagged. Motion upgrade on the v1.0.0 scene. a, b, and c are all landed.

- **a.** Motion tokens, the damped scroll clock, and one Catmull-Rom camera curve per act segment. Hold knots stay exact.
- **b.** Magnetic controls, card tilt, and split text reveals. Pointer follow is off for touch and reduced motion. Act 1 hero copy is not split.
- **c.** Act handoff from `scrollProgress.smoothed` (overlay crossfade, light lerp, DOM depth veil), a high/medium/low performance tier, and a live `prefers-reduced-motion` path. Act 4 stays at 145 draw calls. Act 5 stays at 127. Resting frames stay on the approved picture.

## Venture textures

Not a version tag. The six Act 3 plates shipped as 1600×3600 PNGs (2,628,341 bytes). They are now 1024×2304 WebP at quality 82 (467,902 bytes), content-hashed, and fetched only within 0.1 scroll progress of Act 3. `next.config.ts` `headers()` marks `/textures/:path*` and `/images/:path*` `public, max-age=31536000, immutable`. The pipeline is `npm run optimize:textures`. Detail is in `AGENTS.md`.

## v1.1.0-b

Not tagged. DOM micro-interactions on the v1.1.0-a scene.

- `Magnetic`, `TiltCard`, and `SplitReveal` live in `src/components/motion/`.
- Pointer follow uses the micro and ui springs and only runs for a fine hovering pointer. Reduced motion and touch leave the controls still.
- Act headings reveal when the act becomes active. Persian is per word. Latin is per grapheme. Act 1 hero copy is left on the approved clock.
- Resting hold frames keep the previous layout. The scene and draw-call budget are unchanged.

## v1.1.0-a

Not tagged. Motion on the v1.0.0 scene.

- `src/lib/motion.ts` is the shared duration, easing, and spring set. `globals.css` mirrors it with `--dur-*` and `--ease-*`.
- Lenis writes `scrollProgress.current`. The WebGL frame damps `scrollProgress.smoothed`. Seek snaps.
- `cinema.ts` samples a centripetal Catmull-Rom curve per act segment. Approved hold knots stay exact.

## v1.0.0

Phase 7. Release engineering on the approved v0.9.2 scene.

- `package.json` is `1.0.0`. README covers setup, the five acts, content files, the frameless portrait path, and a Vercel deploy with no secrets.
- `npm ci`, `npm run build`, `npx tsc --noEmit`, `npm run lint`, and `npm run check:catalog` passed on this commit's parent scene.
- Playwright re-captured every act at 1440×900 and 390×844 in English and Persian. Console, page, network, and hydration errors were empty. Draw calls match the v0.9.2 table. Act 4 peak is 145. Act 5 is 127.
- Lighthouse 12.8.2 against `npm run start` on software WebGL: desktop Performance 67, Accessibility 100, Best Practices 100, SEO 100. Mobile Performance 54, Accessibility 100, Best Practices 100, SEO 100. Detail is in `docs/QA_REPORT.md`.

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

## v0.9.2

Phase 6.2. Micro-polish on Act 2 and the Act 4 shipped pose. Detail is in `docs/QA_REPORT.md`.

- Archive screens drop the under-placard. The name stays on the screen. Each screen is a mini site in its own mood: PSM Web Developer, Fitness Point, and a warm brewery mark.
- Extruded `2016`, `2020`, and `2026` are smaller and clear the plate, the screens, and the stack cards.
- The shipped ring eases out after the beams beat. Robots keep a gap, the crate is 30% smaller, and nameplates sit clear of the robots and each other. Building and beams poses are unchanged.
- Every measured sample stays under 150 draw calls. Act 4 shipped is 145. Act 2 at the archive beat is 15.

## v0.9.0

Phase 6. QA, performance, and polish across all five acts. Detail is in `docs/QA_REPORT.md`.

- Act 4 and Act 5 robot kits merge static parts per material and instance pedestals, beams, eyes, thrusters, and chest LEDs. The UI/UX prism no longer uses a transmission pass. Segment counts on the shared kit are lower. Both acts stay under 150 draw calls.
- Canvas DPR is `[1, 1.75]` on desktop and `[1, 1.25]` on viewports under 768px, with Drei `PerformanceMonitor` and `AdaptiveDpr`.
- Act 1 stage, Act 2 group, and zero-opacity nebulae are hidden outside their windows. Act 3, 4, and 5 groups were already gated.
- Battery Store placard chip is `v0.2.0 · 201 PRs` (Persian `v0.2.0 · ۲۰۱ PR`). The slab chip reads `201` / `PULL REQUESTS`.
- English chapter chips match the reference HUD labels. Mobile chips show the number only. Body text and tap targets were tightened. Lenis keeps `syncTouch` off.
- Page title, description, and Open Graph title are `Saeed Mahjobi — ONE COMMAND`.
- Evidence PNGs are in `docs/qa-screenshots/`. `scripts/qa/measure-draws.mjs` and `scripts/qa/capture.mjs` reproduce the draw-call table and the frames.


