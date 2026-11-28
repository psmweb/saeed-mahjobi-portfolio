# QA report — v0.9.0

Phase 6 audit of the five-act scene against `docs/reference/onecommand3d_main.js` and `docs/reference/onecommand3d_index.html`. Frames are in `docs/qa-screenshots/`. Reproduce them with `node scripts/qa/capture.mjs <site> <reference>`. Draw calls: `node scripts/qa/measure-draws.mjs <site>`.

`renderer.info.render.calls` and `triangles` were read from the canvas after the frame settled. Viewport 1440×900, device pixel ratio 1. v0.7.0 was the baseline. v0.9.0 is the production build.

## Draw calls and triangles

| Sample | Internal t | v0.7.0 calls | v0.7.0 triangles | v0.9.0 calls | v0.9.0 triangles |
| --- | ---: | ---: | ---: | ---: | ---: |
| Act 1 | 2.0 | 36 | 2,512 | 29 | 2,408 |
| Act 2 | 7.2 | 23 | 224 | 23 | 224 |
| Venture 1 | 10.65 | 20 | 1,978 | 18 | 1,974 |
| Venture 2 | 11.91 | 32 | 2,956 | 29 | 2,950 |
| Venture 3 | 13.18 | 33 | 3,330 | 30 | 3,324 |
| Venture 4 | 14.44 | 25 | 1,988 | 22 | 1,982 |
| Venture 5 | 15.71 | 25 | 1,988 | 23 | 1,984 |
| Venture 6 | 16.97 | 21 | 1,980 | 20 | 1,978 |
| Act 4 building | 20.4 | 505 | 142,772 | 139 | 38,314 |
| Act 4 beams | 22.3 | 509 | 144,044 | 140 | 38,316 |
| Act 4 shipped | 23.15 | 507 | 142,876 | 145 | 38,166 |
| Act 5 | 26.2 | 465 | 138,880 | 127 | 36,166 |

Act 4 peak is 145 calls. Act 5 is 127. Both are under 150.

## Fixes

- Merged each robot's rigid parts into one mesh per material (`BufferGeometryUtils.mergeGeometries`), shared across the five rigs. Arms, torso, and head still move independently.
- Instanced the chest LEDs, eyes, thrusters, pedestals (body, ring, glow), and the fifteen arena beams.
- Dropped the UI/UX prism's transmission pass. It was re-rendering the opaque scene. The gem stays a transparent physical prism.
- Lowered segment counts on the shared robot kit, pedestal, and lens.
- Hid the Act 1 stage after internal 5.2, the Act 2 group outside 4.4–10.4, and nebulae whose opacity is about zero. Act 3, 4, and 5 groups were already gated.
- DPR is `[1, 1.75]` on desktop and `[1, 1.25]` below 768px, with Drei `PerformanceMonitor` and `AdaptiveDpr`.
- Lenis sets `syncTouch: false`. Reduced motion uses `lerp: 1` and skips wheel smoothing.
- Battery Store placard is `v0.2.0 · 201 PRs`. Persian is `v0.2.0 · ۲۰۱ PR`. The slab chip is `201` / `PULL REQUESTS`.
- English chapter chips are `01 COMMAND` through `05 DEPLOY`. Below `sm` they show the number only, so Persian labels are not clipped. Tap targets on chips, the language toggle, replay, and finale actions are at least 40px on mobile. Small HUD text that was 10px is now 12px, and desktop body copy stays at least 13px.
- Storyteller gem eases in on the reference 1.4–2.1 curve.
- Open Graph and Twitter titles are `Saeed Mahjobi — ONE COMMAND`, matching `<title>` and the meta description.

## Checks

- `npm run build`, `npx tsc --noEmit`, `npm run lint`, and `npm run check:catalog` pass.
- Console, page errors, and failed network responses were empty across the capture (desktop and mobile, English and Persian, all acts).
- Chapter chips land on acts 1–5 in order. After each click the matching `aria-current` chip is the active one.
- Catalog guard is clean. A manual search of `src/` and `public/` found none of the blocked geography, currency, barcode-prefix, price, or withheld-name patterns outside `scripts/check-catalog-guard.mjs`. Rendered English and Persian DOM during the capture did not add any.
- Every Act 4 status surface includes `Live simulation · demo` (`شبیه‌سازی زنده · دمو`), including the shipped toast and the cube faces.
- The portrait slot is the frameless gradient. `public/images/` has no portrait file. No face was generated. The reference arch is an approved deviation and was not copied.
- `<html lang>` and `dir` follow the language toggle. Focus rings use the amber `:focus-visible` rule. `prefers-reduced-motion` skips camera smoothing, the finale beam, and the arena burst. With WebGL context creation blocked, the page still shows "3D stage unavailable on this device." plus the hero, chapter, and act copy.

## Reference comparison

`compare-01.png` through `compare-04.png` pair the reference and the site at presentation t = 2, 6, 10, 13, 16, 20, 23, 27, 30, 33, 38, 42, 47, and 51 seconds (1280×720). The reference fonts and archive photos are not in the repo, so the comparison render uses stand-in fonts and the venture textures already in `public/textures/ventures/`.

Locked differences, not treated as defects:

- English hero and finale lockup use Bebas Neue at `0.06em`, not the reference extruded type.
- The portrait is frameless. The reference arch is not in the scene, and no face was invented.

Act 2 still uses the v0.3.0 glass monoliths. The reference's extruded year numerals and 2020 archive screens were not part of this pass. The camera curve is the one ported in v0.2.0.

## Evidence

Each act, including all six ventures and the Act 4 shipped pose, at 1440×900 English, 1440×900 Persian, 390×844 English, and 390×844 Persian. Names follow `act{N}[-venture{M}]-{desktop|mobile}-{en|fa}.png`.
