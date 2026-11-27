# ONE COMMAND 3D — Full Execution Plan (v0.1.0 → v1.0.0)

**Visual Source of Truth (Pixel-for-Pixel Reference):**
- Video: `/workspace/saeed-resume/preview/one_command_3d_full_52s.mp4`
- Scene & shader/camera source: `/workspace/saeed-resume/preview/onecommand3d/` (`main.js`, `index.html`, `tex/`, `fonts/`)
- **Hard Parity Rule:** Every camera curve, material (PBR obsidian/chrome/amber/glass), lighting rig, HUD element (glass navbar, battery scroll meter, live build log), 5-act transition, 6 venture stages, 5 3D humanoid robot figurines, and Persian RTL mirror must match the approved 52s video **pixel-for-pixel**, with ONLY two approved upgrades:
  1. **Hero Name Font (`SAEED MAHJOBI`):** Replace the opening 3D name font with a sharper, higher-craft display typeface approved by Saeed before locking v0.2.0.
  2. **Portrait Asset & Framing:** Final refined studio portrait inside the arched obsidian-gold monolith (zero face alteration).

**Phase 0 lock (27 Nov 2026):** T0.3 is closed. The hero title font is Bebas Neue at `0.06em` tracking. The portrait is frameless, with no arched frame. Those two choices replace the open items above. The portrait file itself is not in the repo yet.

**Hard Project Rules (Zero Exceptions):**
- Zero mentions of the patterns blocked by `scripts/check-catalog-guard.mjs`: geography, local currency names, the barred barcode prefix, prices, and one withheld personal name.
- Name: **Saeed Mahjobi** (`سعید محجوبی`). Languages: `English (Fluent / Professional)` and `Persian (Native)`.
- All Act 4 demo labels (`PR #201 MERGED`, `Ship release v0.8`) explicitly marked `Live simulation · demo`.
- Clean third-party "Brooklyn" logo from 2020 Brewery preview asset before public release.
- Strict adherence to `SAEED_WORK_CONTRACT.md` (small single-deliverable micro-tasks, fresh agent per task, pre-researched self-contained briefs, explicit "برو" before each major stage, self-QA against reference frames, living docs in `AGENTS.md` + `docs/`).

---

## Semantic Versioning & Git Release Strategy
- **Tagging:** Annotated SemVer tags (`v0.1.0`, `v0.2.0`, …, `v1.0.0`) + `CHANGELOG.md` + `docs/VERSIONS.md` updated at every milestone.
- **Branching:** Small single-task branches (`feat/m1-hero-3d`, `feat/m2-evolution`, etc.) merged cleanly to `main` only after build + typecheck + catalog guard + visual parity check pass.
- **Future Updates:** `v1.0.x` = visual/copy fixes, `v1.x.0` = new ventures/features, `v2.0.0` = major redesign.

---

## End-to-End Phases & Micro-Tasks (0 → 100)

### Phase 0 — Governance, Living Docs, Versioning & Assets (`v0.1.0`)
- **T0.1:** Add `AGENTS.md`, `docs/WORK_CONTRACT.md`, `docs/VERSIONS.md`, `docs/VISUAL_PARITY_SPEC.md`, and `CHANGELOG.md` inside the repo.
- **T0.2:** Copy verified portrait & 2020 archive textures (with Brewery third-party logo cleaned) into `public/images/` and wire `package.json` version `0.1.0` + `v0.1.0` tag.
- **T0.3 (Design Lock with Saeed):** Pick the exact **Hero Display Font** for `SAEED MAHJOBI` and confirm the final **Portrait** image/crop (one visual check, wait for approval).

### Phase 1 — Core 3D Engine, Obsidian Atmosphere & Cinema Camera (`v0.2.0`)
- **T1.1:** Port exact obsidian space, starfield, per-chapter nebula glows, floor reflections, lighting rig, and tone mapping from `onecommand3d/main.js` into `ObsidianAtmosphere.tsx`.
- **T1.2:** Port exact weighted-average smooth camera curves, trailing `lookAt` inertia, orbital dolly sweeps, and FOV breathing tied cleanly to Lenis scroll progress (`0.0 → 1.0`) in `CameraRig.tsx`.
- **T1.3:** Port exact persistent HUD: `GlassNavbar.tsx`, `BatteryScrollMeter.tsx`, `LiveBuildLog.tsx`, and instant `EN (LTR) ↔ FA (RTL)` toggle with zero overlap across desktop & mobile breakpoints.

### Phase 2 — Act 1 (Hero & Command) & Act 2 (10-Year Evolution) (`v0.3.0`)
- **T2.1:** Build `Act1HeroCommand.tsx` + 3D extruded `SAEED MAHJOBI` (with Saeed's newly approved font), live typing terminal (`build --ventures=6 --team=5-agents --verify`), arched obsidian-gold portrait monolith, and orbiting amber Storyteller gem.
- **T2.2:** Build `Act2Evolution.tsx` — 3D camera arc from `2016` first lines → real `2020` archive slabs (`PSM Web Developer`, `Fitness Point`, cleaned `Brewery`) → rising `2026` monoliths (`Next.js 15`, `NestJS 10`, `~50K LOC Python`, `886 CI Tests`).

### Phase 3 — Act 3: All 6 Dedicated Venture Stages (`v0.4.0` → `v0.5.0`)
- **T3.1 (`v0.4.0`):** Build reusable dark-glass 3D Venture Slab component (60% viewport, PBR sheen, glowing accent edge, floating 3D metric chips, left glass info card) + first 3 dedicated stages: **Mikham + Miara**, **Battery Store**, **Trader Bot** (with live scrolling internal UIs).
- **T3.2 (`v0.5.0`):** Build dedicated stages 4–6: **Honarmarket**, **Yadaki Yar** (inventory/POS scrolling UI), and **Sandoq-Yar** (offline barcode scanner `0 123456 789012` + **Xchange** & **Rap Historical** badges).

### Phase 4 — Act 4: 5 3D Humanoid Agent Figurines Arena (`v0.6.0`)
- **T4.1:** Port exact PBR 3D humanoid robot meshes (`AgentFigurines.tsx`: brushed metal sheen, iridescent glossy visors, blinking eyes, torso seams, chest status LEDs, articulated arms, wrist rings, shoulder caps, hover thrusters, 5 role props & color-matched glowing pedestals).
- **T4.2:** Implement interactive `"Ship release v0.8"` (`Live simulation · demo`) cube drop — both scroll-triggered AND visitor-clickable so employers can drop a task and watch all 5 3D robots turn, leap, fire synchronized amber+emerald beams, flip to `SHIPPED ✓`, and celebrate.

### Phase 5 — Act 5: Bilingual Persian RTL Mirror & Command Center Finale (`v0.7.0`)
- **T5.1:** Implement golden light-beam wipe into full Persian RTL (`Vazirmatn`, mirrored layout, `سعید محجوبی · ۱۰ سال ساختن، فرماندهی با ۵ ایجنت`), final portrait monolith, pulsing `Approve & Deploy ✓`, `Download Resume PDF ↓` (wired to real EN/FA PDFs), `github.com/psmweb`, and hovering 5 robots.

### Phase 6 — Pixel-for-Pixel QA, Responsive & Performance Audit (`v0.9.0`)
- **T6.1:** Automated Playwright visual comparison across desktop (`1440×900`, `1280×720`) and mobile (`390×844`) in both EN and FA, verifying hover/focus/long-text/reduced-motion states and side-by-side parity against the 18 reference keyframes from `one_command_3d_full_52s.mp4`.
- **T6.2:** WebGL performance & accessibility pass (60fps target, mobile GPU fallback, Lighthouse, `npm run build` + `tsc` + `lint` + `check:catalog` all green).

### Phase 7 — Production Release & GitHub Sync (`v1.0.0`)
- **T7.1:** Finalize `AGENTS.md`, `docs/`, `CHANGELOG.md`, tag `v1.0.0`, publish/sync to GitHub (once repo URL is connected) and verify live deployment URL directly.
