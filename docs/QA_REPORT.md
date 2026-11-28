# QA report — v0.9.1

Phase 6.1 parity pass on top of the v0.9.0 performance budget. Frames are in `docs/qa-screenshots/`. Reproduce them with `node scripts/qa/capture.mjs <site> <reference>`. Draw calls: `node scripts/qa/measure-draws.mjs <site>`.

`renderer.info.render.calls` and `triangles` were read from the canvas after the frame settled. Viewport 1440×900, device pixel ratio 1. v0.9.0 is the previous release. v0.9.1 is this production build.

## Draw calls and triangles

| Sample | Internal t | v0.9.0 calls | v0.9.0 triangles | v0.9.1 calls | v0.9.1 triangles |
| --- | ---: | ---: | ---: | ---: | ---: |
| Act 1 | 2.0 | 29 | 2,408 | 32 | 14,252 |
| Act 2 | 7.2 | 23 | 224 | 18 | 3,798 |
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

Act 4 peak is 145 calls. Act 5 is 127. Act 1 is 32. Every sample is under 150. Venture counts are unchanged. Act 1 and Act 2 triangles rose because the years and the hero name are extruded type.

## Fixes

- Removed the flat dark slab in the hero. The portrait slot is a soft amber/obsidian glow at the reference arch position and scale. No border and no generated face. If `public/portrait/saeed.png` is present it is drawn as a frameless cut-out with a soft edge mask.
- English hero name is drei `Text3D` in Bebas Neue (`public/fonts/bebas-neue.json`), tracking `0.06em`. Top word is chrome. Bottom word is amber-gold. Width matches the reference lockup. The HTML `h1` stays for accessibility and is the small-screen fallback. Persian is HTML Vazirmatn in the same slot.
- The storyteller gem stays, and it sits clear of the name and the tagline on desktop and on a phone.
- Act 2 is rebuilt from the reference clock: extruded `2016` with the first-lines plate, extruded `2020` with three archive screens (PSM Web Developer, Fitness Point, studio mark), extruded gold `2026` above the four stack cards. The overlay switches per beat in EN and FA. The monoliths and the stray cube are gone. Screen bodies share one obsidian material.
- Persian nav chips, status pills, eyebrows, and the languages line use Vazirmatn. `font-mono` falls through to Vazirmatn for Arabic script and keeps JetBrains Mono for Latin, so tokens such as `one-command --deploy --all` and `v0.8` stay monospace. The Act 5 Persian primary button is `تأیید و استقرار ✓`.
- Act 4 desktop camera eases back during the arena so the five cards clear the battery and the nameplates sit above the build log. Nameplate width stays inside the gap to the neighboring rig, including the mobile ring.
- Phone viewports pull the venture camera back and look slightly lower, so the slab is framed with a margin above the placard and clear of the battery. Desktop Act 3 framing is unchanged.

## Checks

- `npm run build`, `npx tsc --noEmit`, `npm run lint`, and `npm run check:catalog` pass.
- Console, page errors, and failed network responses were empty across the capture (desktop and mobile, English and Persian, all acts).
- Chapter chips land on acts 1–5 in order. After each click the matching `aria-current` chip is the active one.
- Catalog guard is clean. Rendered English and Persian DOM during the capture did not add blocked patterns.
- Every Act 4 status surface includes `Live simulation · demo` (`شبیه‌سازی زنده · دمو`).
- The portrait slot is the frameless glow. `public/portrait/saeed.png` is not in the repo. No face was generated. The reference arch was not copied.
- `<html lang>` and `dir` follow the language toggle. With WebGL context creation blocked, the page still shows "3D stage unavailable on this device." plus the hero, chapter, and act copy.

## Reference comparison

`compare-01.png` through `compare-04.png` pair the reference and the site at presentation t = 2, 6, 10, 13, 16, 20, 23, 27, 30, 33, 38, 42, 47, and 51 seconds (1280×720). The comparison render uses a stand-in face for the reference extrusion and the venture textures already in `public/textures/ventures/`.

Locked differences:

- English hero and finale lockup use Bebas Neue at `0.06em`. The hero extrusion uses that face. The reference comparison face is a stand-in.
- The portrait is frameless. The reference arch is not in the scene, and no face was invented.

## Evidence

Each act, including all six ventures and the Act 4 shipped pose, at 1440×900 English, 1440×900 Persian, 390×844 English, and 390×844 Persian. Names follow `act{N}[-venture{M}]-{desktop|mobile}-{en|fa}.png`.
