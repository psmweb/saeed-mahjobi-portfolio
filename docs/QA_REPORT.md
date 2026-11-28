# QA report — v1.0.0

v1.0.0 re-checked the approved v0.9.2 scene. Visuals, copy, and layout did not change. The v0.9.2 sections below stay the record of the last visual pass. Frames in `docs/qa-screenshots/` are that pass. Reproduce a capture with `node scripts/qa/capture.mjs <site> <reference>`. Draw calls: `node scripts/qa/measure-draws.mjs <site>`.

## Release regression (2026-11-28)

Production server after `npm ci` and `npm run build`, then `npm run start`. Viewport for draw calls: 1440×900, device pixel ratio 1. WebGL renderer in this VM: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero))), SwiftShader driver.

### Commands

`npm ci`, `npm run build`, `npx tsc --noEmit`, `npm run lint`, and `npm run check:catalog` passed.

### Draw calls

Remeasured with `scripts/qa/measure-draws.mjs`. Every sample matches v0.9.2. `errors` was empty.

| Sample | Internal t | Calls | Triangles |
| --- | ---: | ---: | ---: |
| Act 1 | 2.0 | 32 | 14,252 |
| Act 2 | 7.2 | 15 | 3,792 |
| Venture 1 | 10.65 | 18 | 1,974 |
| Venture 2 | 11.91 | 29 | 2,950 |
| Venture 3 | 13.18 | 30 | 3,324 |
| Venture 4 | 14.44 | 22 | 1,982 |
| Venture 5 | 15.71 | 23 | 1,984 |
| Venture 6 | 16.97 | 20 | 1,978 |
| Act 4 building | 20.4 | 139 | 38,314 |
| Act 4 beams | 22.3 | 140 | 38,316 |
| Act 4 shipped | 23.15 | 145 | 38,166 |
| Act 5 | 26.2 | 127 | 36,166 |

Act 4 peak is 145 calls. Act 5 is 127. Both stay under 150.

### Capture

`scripts/qa/capture.mjs` walked every act, including the six venture stages, at 1440×900 and 390×844, in English and Persian. Console errors, page errors, and failed network responses were empty. That set includes hydration failures, which surface as console or page errors. Chapter chips landed on acts 1–5 in order (`aria-current` indexes 0–4). With WebGL context creation blocked, the page still shows "3D stage unavailable on this device." plus the hero, chapter, and act copy.

The reference font and texture pack is not in this repo, so the four comparison sheets were not replaced. They remain the v0.9.2 pairs.

### Lighthouse

Lighthouse 12.8.2, Headless Chrome 157, against `http://127.0.0.1:3020`. This VM composites WebGL with SwiftShader, so the Performance score understates a desktop or phone GPU. Main-thread time is the reason both Performance scores sit where they do: desktop total blocking time was 39,680 ms and time to interactive was 45.7 s. Mobile total blocking time was 159,530 ms and time to interactive was 183.5 s. Cumulative layout shift was 0 on both.

| Form factor | Performance | Accessibility | Best Practices | SEO |
| --- | ---: | ---: | ---: | ---: |
| Desktop | 67 | 100 | 100 | 100 |
| Mobile | 54 | 100 | 100 | 100 |

Accessibility, best practices, and SEO scored 100 on both form factors. No alt text, label, meta description, `lang`, or `dir` change was required. The document already has a meta description, Open Graph title, `lang="en"`, and `dir="ltr"`, and the language toggle updates `lang` and `dir`.

### Catalog grep

`npm run check:catalog` passed. A separate search of `src/`, text files under `public/`, `docs/`, `README.md`, `AGENTS.md`, `CHANGELOG.md`, and `ARCHITECTURE.md`, plus the text of both resume PDFs, found no standalone match for the blocked tokens. An unanchored search for one of those tokens also hits ordinary English words such as `material` and `editorial`. Those are not the blocked term, and no copy was changed.

---

# QA report — v0.9.2

Phase 6.2 micro-polish on top of the v0.9.1 parity pass. Frames are in `docs/qa-screenshots/`. Reproduce them with `node scripts/qa/capture.mjs <site> <reference>`. Draw calls: `node scripts/qa/measure-draws.mjs <site>`.

`renderer.info.render.calls` and `triangles` were read from the canvas after the frame settled. Viewport 1440×900, device pixel ratio 1. v0.9.1 is the previous release. v0.9.2 is this production build.

## Draw calls and triangles

| Sample | Internal t | v0.9.1 calls | v0.9.1 triangles | v0.9.2 calls | v0.9.2 triangles |
| --- | ---: | ---: | ---: | ---: | ---: |
| Act 1 | 2.0 | 32 | 14,252 | 32 | 14,252 |
| Act 2 | 7.2 | 18 | 3,798 | 15 | 3,792 |
| Venture 1 | 10.65 | 18 | 1,974 | 18 | 1,974 |
| Venture 2 | 11.91 | 29 | 2,950 | 29 | 2,950 |
| Venture 3 | 13.18 | 30 | 3,324 | 30 | 3,324 |
| Venture 4 | 14.44 | 22 | 1,982 | 22 | 1,982 |
| Venture 5 | 15.71 | 23 | 1,984 | 23 | 1,984 |
| Venture 6 | 16.97 | 20 | 1,978 | 20 | 1,978 |
| Act 4 building | 20.4 | 139 | 38,314 | 139 | 38,314 |
| Act 4 beams | 22.3 | 140 | 38,316 | 140 | 38,316 |
| Act 4 shipped | 23.15 | 145 | 38,166 | 145 | 38,166 |
| Act 5 | 26.2 | 127 | 36,166 | 127 | 36,166 |

Act 4 peak is 145 calls. Act 5 is 127. Act 2 at the archive beat is 15. Every sample is under 150. Venture, Act 1, Act 4, and Act 5 counts are unchanged. Act 2 dropped three calls because the under-screen placards are gone.

## Fixes

- The three archive screens no longer draw a glass placard under the monitor. The site name stays on the screen texture. Each texture is a mini site: nav, headline, call to action, and an image block. PSM Web Developer is dark with amber. Fitness Point is bold. The brewery screen is a warm studio mark. No third-party logos and no prices.
- Extruded `2020` is smaller and sits above the screens with air between the baseline and the monitor tops. `2026` clears the stack cards. `2016` clears the first-lines plate. The 2016 plate sits lower so the year does not rest on it.
- The Act 4 converge still lands on the reference ring through the beams beat. After that window the ring eases outward, so the shipped pose keeps a gap between robots. The crate scales to 70% on that same ease, and the shipped nameplates sit under the figurines, clear of the robots, the crate, and each other. Building and beams poses are unchanged.

## Checks

- `npm run build`, `npx tsc --noEmit`, `npm run lint`, and `npm run check:catalog` pass.
- Console, page errors, and failed network responses were empty across the capture (desktop and mobile, English and Persian, all acts).
- Chapter chips land on acts 1–5 in order. After each click the matching `aria-current` chip is the active one.
- Catalog guard is clean. Rendered English and Persian DOM during the capture did not add blocked patterns.
- Every Act 4 status surface includes `Live simulation · demo` (`شبیه‌سازی زنده · دمو`).
- The portrait slot is the frameless glow. `public/portrait/saeed.png` is not in the repo. No face was generated. The reference arch was not copied.
- `<html lang>` and `dir` follow the language toggle. With WebGL context creation blocked, the page still shows "3D stage unavailable on this device." plus the hero, chapter, and act copy.

## Reference comparison

`compare-01.png` through `compare-04.png` pair the reference and the site at presentation t = 2, 6, 10, 13, 16, 20, 23, 27, 30, 33, 38, 42, 47, and 51 seconds (1280×720). The reference half is the v0.9.1 comparison render. The reference font and archive photo pack are not in this repo, so that half is reused rather than re-rendered with a stand-in face.

Locked differences:

- English hero and finale lockup use Bebas Neue at `0.06em`. The hero extrusion uses that face. The reference comparison face is a stand-in.
- The portrait is frameless. The reference arch is not in the scene, and no face was invented.
- Act 2 years are Bebas Neue extrusions fitted to the reference scale. The reference comparison face for those numerals is Space Grotesk.

## Overlay scroll paint

Act 1, Act 2, Act 3, and `TransitionVeil` used to copy `scrollProgress.smoothed` into React state, so each one rendered on every published frame. They now write `opacity`, `filter`, and `transform` from the subscription. React state remains for discrete changes only.

Dev server, 1440×900, `deviceScaleFactor` 1. A script sought progress from 0 to 1 in equal steps and counted render-function calls. React strict mode in dev calls the render function twice per commit, so a per-frame render shows up as 2.

| Overlay | 49 steps, before | 49 steps, after | 97 steps, after |
| --- | ---: | ---: | ---: |
| `Act1HeroOverlay` | 98 | 8 | 12 |
| `Act2EvolutionOverlay` | 98 | 12 | 10 |
| `Act3VentureOverlay` | 98 | 56 | 78 |
| `TransitionVeil` | 98 | 12 | 14 |

The 97-step pass was measured after the fix only. Act 1, Act 2, and the veil stay near the 49-step counts. Act 3 rises because a finer grid crosses more venture-card thresholds (index, reveal, settle, pointer, hidden), not because opacity is stored in state.

Pixel diff of the same 10 stops, before against after, 1440×900, `pixelmatch` threshold 0.1:

| Progress | Different pixels | Share |
| --- | ---: | ---: |
| 0.000 | 128 | 0.0099% |
| 0.080 | 0 | 0% |
| 0.125 | 127 | 0.0098% |
| 0.132 | 1,292 | 0.0997% |
| 0.190 | 44 | 0.0034% |
| 0.268 | 0 | 0% |
| 0.300 | 0 | 0% |
| 0.420 | 0 | 0% |
| 0.620 | 0 | 0% |
| 0.880 | 198 | 0.0153% |

1,789 of 12,960,000 pixels differ (0.0138%). Computed `opacity`, `filter`, and `transform` matched at every stop, including the Act 1/2 handoff (`0.125`, `0.132`) and the Act 3 placard at `0.268` (opacity `0.578074`, `blur(3.36px)`, `translateX` landing on `matrix(1, 0, 0, 1, -11.8139, 0)`). The leftover pixels sit on the blinking command caret, an in-flight split reveal, and the Act 5 line reveal, which keep their own clocks.

## Evidence

Each act, including all six ventures and the Act 4 shipped pose, at 1440×900 English, 1440×900 Persian, 390×844 English, and 390×844 Persian. Names follow `act{N}[-venture{M}]-{desktop|mobile}-{en|fa}.png`.
