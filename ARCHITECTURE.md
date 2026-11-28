# Architecture

ONE COMMAND is a single-page, five-act portfolio. The scaffold compiles, renders the verified catalog in English and Persian, and holds typed placeholders for the 3D stage. Full character animation and scroll choreography are the next build, after the video mockup is approved.

## Folder map

```
src/
  app/
    layout.tsx          fonts, document shell, metadata
    page.tsx            mounts the client shell
    globals.css         obsidian, amber, emerald, cyan tokens and RTL font rules
  context/
    LanguageContext.tsx instant EN (LTR) / FA (RTL) switch, dir on <html>
  components/
    PortfolioShell.tsx  composes scroll, stage, HUD, and acts
    SmoothScroll.tsx    Lenis, with horizontal deltas mirrored in RTL
    Portrait.tsx        editorial and cutout frames, with a monogram if a file is missing
    scene/
      PortfolioCanvas.tsx
      CameraRig.tsx
      ObsidianAtmosphere.tsx
      AmberStoryteller.tsx
      AgentFigurines.tsx
      HumanoidSkeleton.tsx
      SceneBoundary.tsx
    acts/
      ActFrame.tsx
      Act1HeroCommand.tsx
      Act2Evolution.tsx
      Act3VentureStage.tsx
      Act4AgentArena.tsx
      Act5FinaleCommandCenter.tsx
    hud/
      GlassNavbar.tsx
      BatteryScrollMeter.tsx
      LiveBuildLog.tsx
      LanguageToggle.tsx
  data/
    ventures.ts         six active products plus catalog and archive facts
    agents.ts           five humanoid slots and the demo badge
    timeline.ts         2020 on the archive only; every other row undated
    portraits.ts        public image paths
    i18n/
      types.ts
      en.ts
      fa.ts
      index.ts
  lib/
    direction.ts        mirrorX, mirrorVector, GSAP clamp
public/
  images/               saeed_editorial_portrait.png, saeed_cutout_clean.png
scripts/
  check-catalog-guard.mjs
```

## Five-act scroll choreography

Each act is a full-viewport section. Lenis (`lerp` 0.1) writes document progress to `scrollProgress.current`. The WebGL frame damps that into `scrollProgress.smoothed` (`THREE.MathUtils.damp`, lambda 7). The camera and scene acts read the damped clock. Seek and immediate chapter jumps snap it. `src/lib/motion.ts` holds the shared durations, easings, and springs; `globals.css` mirrors them as `--dur-*` and `--ease-*`.

`cinema.ts` builds one centripetal Catmull-Rom curve per act segment from the approved camera. Hold frames are copied exactly. Moves between holds are sampled with the cinematic ease. Reduced motion skips the damp, the roll, and the curve.

| Act | Section | What the scaffold shows | What the visual build adds |
| --- | --- | --- | --- |
| 01 Command | `#command` | Name, languages, editorial portrait, command prompt | Storyteller steps forward, camera closes in |
| 02 Evolution | `#evolution` | 2020 archive, then undated catalog rows | Camera travels the timeline |
| 03 Venture stage | `#ventures` | Six active cards, then Xchange, Rap Historical, and the archive | Agents turn toward the product stage |
| 04 Agent arena | `#arena` | Five skeleton slots, always badged `Live simulation · demo` | Final humanoid meshes and any interactive task |
| 05 Command center | `#finale` | Cutout portrait and the 6 / 2020 / 5 recap | Camera returns to the amber storyteller |

`cameraBeats` keeps a position and look-at for every act so the scroll binding has a typed target. Do not treat those coordinates as final framing.

## Bilingual RTL rules

- Locales are `en` and `fa`. English is LTR. Persian is RTL.
- `LanguageContext` sets `documentElement.lang` and `documentElement.dir` in the toggle handler, so the switch is immediate.
- The provider also sets `dir` and `lang` on its wrapper. Layout CSS uses logical spacing (`ms-`, `ps-`, `inset-e-`, `border-s`, `text-start` behavior from the `dir` attribute).
- `html[dir="rtl"]` switches body, sans, and display text to Vazirmatn. JetBrains Mono stays on the log, the prompt, and metric chips.
- `mirrorX` and `mirrorVector` flip horizontal motion and the agent lineup. Vertical scroll is not reversed.
- Lenis `virtualScroll` applies `mirrorX` to `deltaX` only.
- Act entrances use Motion with a mirrored X offset. Reduced motion shows the build log at once and skips the camera sway. Lenis already honors `prefers-reduced-motion`.
- Any interactive agent task must show the badge from `DEMO_BADGE`: `Live simulation · demo` / `شبیه‌سازی زنده · دمو`.

## Content rules

`src/data/ventures.ts` is the fact list. English and Persian strings in `src/data/i18n` may translate those facts. They may not add new ones.

Verified active products:

- Mikham + Miara — 400K+ businesses, 13 categories, 5 online services
- Battery Store — Next.js 15, NestJS, PR #201
- Trader Bot — ~50K LOC Python, 886 CI tests, live trading disarmed by default
- Honarmarket — 1,450+ designs
- Yadaki Yar — v0.7.0, FastAPI + PostgreSQL
- Sandoq-Yar — offline barcode POS PWA

Also named, without extra claims: Xchange, Rap Historical, and the 2020 archive.

The only verified year is 2020, on the archive. The name on the page is Saeed Mahjobi / سعید محجوبی. Languages are English (Fluent / Professional) and Persian (Native).

Do not add geography, local currency, prices, barcode prefixes, or personal names outside this catalog. `npm run check:catalog` scans `src`, `public`, `README.md`, and this file for those exclusions.

Portrait bytes in `public/images/` are copied as-is. Do not repaint the face.

## Stage skeleton

`HumanoidSkeleton` is a capsule rig: head, torso, arms, legs. `AmberStoryteller` is the amber narrator. `AgentFigurines` places the five slots from `agents.ts` and mirrors them in RTL. `ObsidianAtmosphere` sets the `#05070C` void, amber key light, and a cyan fill. `SceneBoundary` keeps the catalog readable if WebGL fails. The canvas is mounted with `ssr: false`.

Design tokens in `globals.css`:

- Obsidian `#05070C`
- Amber `#F59E0B`
- Emerald `#10B981`
- Cyan `#38BDF8`

## Commands

```bash
npm install
npm run dev
npm run build
npx tsc --noEmit
npm run lint
npm run check:catalog
```

Dev server: `npm run dev`. To pin a port: `npm run dev -- -p 43123`.
