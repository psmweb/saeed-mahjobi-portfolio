# AGENTS.md

Onboarding for anyone changing the Saeed Mahjobi portfolio (`ONE COMMAND`). Read this file, then `docs/WORK_CONTRACT.md`, `docs/EXECUTION_PLAN.md`, and `docs/VISUAL_PARITY_SPEC.md`, before editing.

## What this repo is

A Next.js 15 App Router, React 19, TypeScript, Tailwind CSS single page. English is LTR. Persian is RTL (`Vazirmatn`). Name on the page: **Saeed Mahjobi** (`سعید محجوبی`). Languages: English (Fluent / Professional) and Persian (Native).

## Live status

**v1.0.0 released.** The shipped scene is the approved v0.9.2 visual build: Act 2 archive screens and year scale, plus the Act 4 shipped spacing. No visual, copy, or layout change landed in v1.0.0. Act 4 peaks at 145 draw calls and Act 5 at 127. Both stay under 150. Evidence frames live in `docs/qa-screenshots/`. The release check, including Lighthouse, is in `docs/QA_REPORT.md`.

v1.1.0 is the motion upgrade on that scene, in three untagged parts. v1.1.0-a adds the motion tokens, the damped scroll clock, and the cinematic camera curves. v1.1.0-b adds DOM micro-interactions: magnetic controls, card tilt, and split text reveals. Act 1 hero copy is not split, so the Bebas Neue lockup and the 52s hero entrance stay on the approved clock. v1.1.0-c adds the act handoff, the load-time performance tier, and a live reduced-motion path. Hold frames stay on the approved picture. Act 4 still peaks at 145 draw calls and Act 5 at 127.

Phase 1 lengthens that show and lightens the venture plates. Scroll travel is `SCROLL_VIEWPORTS` (13) in `cinema.ts`, so a 900px viewport scrolls 11,700px. Act travels are about 1.68 / 1.80 / 5.05 / 2.48 / 2.00 viewports. Section heights are `svh`, and the last section includes the viewport already on screen. Lenis is the only smoother (`lerp` 0.075, `wheelMultiplier` 0.6, `touchMultiplier` 1). One WebGL frame calls `lenis.raf` and then copies progress onto the scene clock. Act 2–5 headings use the soft masked reveal. Venture plates load at `ACT3_SCROLL_START - 0.1`. The Act 1 slot now holds the approved editorial cutout, with the amber glow left as a backlight.

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
- `src/components/motion/` — DOM micro-interactions and the act-handoff veil. `Magnetic` springs a control toward the pointer (6px, `springPreset.micro`). `TiltCard` tilts a card toward the pointer (5°, `springPreset.ui`) and adds a specular sheen. `SplitReveal` is the soft masked heading reveal (see Motion). Pointer follow runs only for `(hover: hover) and (pointer: fine)` and is off under `prefers-reduced-motion`. `TransitionVeil` is the depth-of-field stand-in and is absent outside an act boundary. Resting frames render the untransformed page.
- `src/data/` — ventures, agents, timeline, resumes, portraits, `i18n/en.ts`, `i18n/fa.ts`.
- `src/lib/motion.ts` — durations, easings, critically damped springs, and `scrollTuning` (Lenis `lerp` 0.075, `wheelMultiplier` 0.6, `touchMultiplier` 1). CSS mirrors the durations and easings as `--dur-*` and `--ease-*`.
- `src/lib/direction.ts` — `mirrorX` / `mirrorVector`. Vertical scroll is not reversed. The GSAP ticker is asleep; nothing in the page tweens through it.
- `src/lib/scrollProgress.ts` — Lenis writes `current`. The same WebGL frame copies it onto `smoothed`. There is no second damp. Seek and immediate scrolls snap `smoothed` onto `current`. Reduced motion keeps them equal and is updated from `matchMedia` while the page is open.
- `src/lib/actHandoff.ts` — scroll-only crossfade at the four act cuts. The window is 0.35 viewport (`HANDOFF_VIEWPORTS`), 1.4s of the 52s clock. Reduced motion uses `duration.micro`.
- `src/lib/performanceTier.ts` — high / medium / low budget from the device, chosen at load and again on resize.
- `public/resume/` — EN and FA resume PDFs.
- `public/textures/ventures/` — six scrolling UI textures, one per venture stage. See Venture textures below.
- `src/data/ventureTextures.ts` — hashed WebP URLs and average colors. Generated by `npm run optimize:textures`.
- `src/lib/ventureTextureLoad.ts` — starts that fetch at `ACT3_SCROLL_START - 0.1`.
- `public/portrait/saeed-portrait-editorial.webp` — approved frameless editorial cutout, 1080×2003 WebP with alpha. Do not recompress it or redraw the face. `saeed-portrait-editorial-720.webp` is the mobile width from `npm run optimize:portrait`. The Act 1 overlay draws it with `object-fit: contain` and `object-position: bottom`. The 3D slot keeps the amber glow as a backlight only.
- `docs/reference/onecommand3d_main.js` and `docs/reference/onecommand3d_index.html` — pixel reference only. The Next.js build must not import them.

## Venture textures

The shipped plates are 1024×2304 WebP. `npm run optimize:textures` runs `scripts/optimize-textures.mjs` with dev-only `sharp`. It resizes the 1600×3600 PNGs, encodes WebP at quality 82 (stepping down only if the six files would pass 500 KB), and names each file with the first 8 hex characters of the SHA-256 of its bytes. The script rewrites `src/data/ventureTextures.ts` and deletes the PNGs from `public/` so they are not in the bundle. The PNGs remain in git history. Restore one with `git show <commit>:public/textures/ventures/<slug>.png`, then rerun the script.

Act 3 and the Act 4 target cards request those URLs at `VENTURE_TEXTURE_LOAD_AT`, which is `ACT3_SCROLL_START - 0.1`. `ACT3_SCROLL_START` is the Act 3 opening on the monotone time map (`ACT_BOUNDARY_INTERNAL[1]`, internal 9.9). Until a plate arrives, the slab is that file's average color, then the image fades in over `duration.ui`. Reduced motion shows the plate as soon as it has uploaded. The texture uses `SRGBColorSpace`, mipmaps when the context is WebGL2, anisotropy capped at 4, and `gl.initTexture` immediately after load. The visible crop is unchanged: 1024×2304 and 1600×3600 are both 4:9.

`next.config.ts` `headers()` sets `Cache-Control: public, max-age=31536000, immutable` on `/textures/:path*` and `/images/:path*`. Hashed filenames make that cache safe. `/portrait/saeed-portrait-editorial.webp` is not in the list. That path is fixed, and an immutable year cache would pin the first response. Do not set `output` in `next.config.ts`. The deploy build inserts `output: 'standalone'` itself.

Level-0 GPU memory for one plate is width × height × 4. Six 1600×3600 plates with mipmaps off were 138,240,000 bytes. Six 1024×2304 plates are 56,623,104 bytes at level 0 and 75,497,448 bytes with the mip chain.

## Hard rules

- Public copy states only facts that are already in `src/data` or `docs/CATALOG.md`.
- No prices. No secrets, tokens, or keys in the repo.
- The exact blocked patterns (geography, local currency names, a barcode prefix, and one personal name) live only in `scripts/check-catalog-guard.mjs`. Do not retype those patterns into docs, source, or public files. `npm run check:catalog` scans `src/`, `public/`, `docs/`, `AGENTS.md`, `CHANGELOG.md`, `README.md`, and `ARCHITECTURE.md`.
- Any interactive agent task is labeled `Live simulation · demo` (`شبیه‌سازی زنده · دمو`).
- Resume links: `/resume/Saeed_Mahjobi_Resume_EN.pdf` and `/resume/Saeed_Mahjobi_Resume_FA.pdf` (`src/data/resumes.ts`).

## Motion

Scroll and the camera share one clock, then the picture eases on top of it.

- **Tokens.** `src/lib/motion.ts` is the duration, easing, and spring set (`micro` 0.18s, `ui` 0.32s, `reveal` 0.6s, `scene` 1.1s). `globals.css` exposes the same values as `--dur-*` and `--ease-*`. HUD color changes, overlay fades, and the Act frame use those tokens. Reduced motion collapses the CSS durations.
- **One clock.** Lenis is constructed with `autoRaf: false`. `CameraRig` calls `driveScroll` at frame priority `-2`, and that calls `lenis.raf` then copies `current` onto `smoothed`. The camera sample at priority `-1` reads `smoothed`. A bootstrap `requestAnimationFrame` runs only until the canvas has driven a frame, then it cancels. Wheel input in one frame is clamped to the shortest act (`shortestActProgress`). `__oneCommandSeek` and an immediate `scrollToAct` copy `current` into `smoothed` on the same turn. When reduced motion is on, `smoothed` stays equal to `current`, `smoothWheel` is off, and `lerp` is 1.
- **Scroll length.** `SCROLL_VIEWPORTS` is 13. `ACT_SCROLL_VIEWPORTS` is the travel of each act, derived from the 52s cuts. Landmark sections use `actSectionHeight`, in `svh`. The last section is one viewport taller so its travel stays on screen at the end.
- **Camera curves.** `cinema.ts` bakes the approved camera into one centripetal `CatmullRomCurve3` per act segment. Hold segments are sampled so every approved knot is hit exactly, including progress `0`, `0.1`, `0.3`, `0.5`, `0.7`, `0.9`, and `1`. Glide segments ease scroll time with `easeInOutCubic` and sample the curve at that eased time. Field of view and roll use the same blend. `mapPresentationTime` is a monotone cubic through the presentation knots. The venture run from 14.2s to 34.0s stays linear, and the join into it no longer steps from 0.90 to 0.38. Reduced motion keeps the reference pose, no roll, and a fixed field of view.
- **Act handoff.** The cuts are `ACT_BOUNDARY_INTERNAL` in `cinema.ts` (internal 4.8, 9.9, 17.6, 23.5). `actHandoff` is a pure function of `scrollProgress.smoothed`. `pulse` is 0 outside a 0.35-viewport window (1.4s of the show) and 1 on the cut. Outgoing overlays can only dim. An incoming overlay eases in early only when that copy is on screen by the end of the window, and it blurs with `easeInOutCubic`. Key, hemisphere, fog, and the arena rig return to the approved values the moment the window closes. Depth of field is a DOM vignette. The high tier adds a 2.2px backdrop blur. There is no postprocessing pass, so Act 4 stays at 145 draw calls and Act 5 at 127. The canvas does not keep `preserveDrawingBuffer`.
- **Performance tier.** High caps device pixel ratio at 2, medium at 1.5, low at 1.25. Ship-burst sparks are 36, 18, and 10. The starfield stays at 2600 points so the hold frames match. A coarse pointer or a narrow viewport takes the lower budget, and pointer follow stays off. `PerformanceMonitor` can mark the session degraded, drop the burst to 8 sparks, and skip the depth veil.
- **Text reveal.** `SplitReveal` eases Act 2–5 headings. Each line is a wrapper with `padding-block: 0.12em` and `mask-image: linear-gradient(to bottom, #000 70%, transparent)`, swept with `mask-position`. There is no `overflow: hidden`. Units animate only opacity (0→1), `filter` (`blur(8px)`→`blur(0)`), and `translateY` (`0.5em`→0) on `cubic-bezier(0.22, 1, 0.36, 1)`. That curve lives on the reveal, not in `motion.ts`, because the shared file also drives the clock and the camera. Persian, RTL, and `fa` split by word only (0.7s, 0.06s stagger, reading order) so letters stay joined. Latin splits by character (0.5s, 0.015s stagger) inside `white-space: nowrap` words. The split is memoized for the life of the reveal. `will-change` is `opacity, transform, filter` only while a unit runs, then removed. On completion the filter is set to `none` and the resting render is the original string, so tracking, kerning, and the Bebas Neue `0.06em` lockup match the page. Act 1 hero copy is not split. The container has `aria-label` of the full text; the split spans are `aria-hidden`.
- **Reduced motion.** The listener is live. Lenis turns `smoothWheel` off and sets `lerp` to 1, so the wheel is native. The handoff window shrinks to `duration.micro` and becomes an opacity fade with no blur and no light lerp. Magnetic and tilt stay off. A split reveal that plays under reduced motion is a 0.18s opacity fade with no blur and no travel; turning reduced motion on mid-reveal shows the text immediately. Robot idle clocks stay at rest.

## Pixel parity

Match `docs/reference/onecommand3d_main.js` and `docs/reference/onecommand3d_index.html` for camera curves, PBR materials, lighting, the glass HUD, the five-act clock, six venture stages, five robot figurines, and the Persian mirror.

## Known deviations

1. Hero title font is **Bebas Neue**, weight 400, tracking `0.06em`, by owner choice. English Act 1 is a 3D extrusion (`public/fonts/bebas-neue.json`, drei `Text3D`). The HTML `h1` stays for accessibility, visually hidden on desktop and shown on small screens. Persian Act 1 is HTML Vazirmatn, not 3D. Act 5 English lockup stays Bebas Neue.
2. The portrait is the approved frameless editorial cutout. No arched obsidian-gold frame, border, or CSS crop. It sits on the end side of the hero, bottom-aligned, so the built-in fade dissolves into `#05070C`. The amber glow stays behind it. Do not alter the face.
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
