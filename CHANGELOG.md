# Changelog

All notable changes to this portfolio are documented here. The format follows Keep a Changelog. Versions follow Semantic Versioning.

## [1.0.0] - 2026-11-28

Production release of the five-act portfolio. The scene, copy, and layout are the v0.9.2 build. This version adds the release record: README, version history, and the checks below.

### Added

- README in English and Persian: setup, scripts, folder map, portrait slot, content files, performance, and Vercel deploy notes.
- Lighthouse desktop and mobile scores in `docs/QA_REPORT.md`.
- Version table in `docs/VERSIONS.md` with the date, pull request, and merge commit for each release that has one.

### Release summary

- **0.1.0** — Governance, living docs, Bebas Neue hook, resume PDFs, and the six venture textures.
- **0.2.0** — Obsidian atmosphere, the 0–52s cinema camera, and the glass HUD.
- **0.3.0** — Act 1 command hero and Act 2 evolution.
- **0.4.0** — Venture stages 1–3 (Mikham + Miara, Battery Store, Trader Bot).
- **0.5.0** — Venture stages 4–6 (Honarmarket, Yadaki Yar, Sandoq-Yar).
- **0.6.0** — Five PBR robot figurines and the ship-release demo, labelled `Live simulation · demo`.
- **0.7.0** — Persian RTL finale, resume and GitHub controls, and the five agents at rest.
- **0.9.0** — Draw-call pass, responsive polish, and the QA evidence. Act 4 and Act 5 stay under 150 calls.
- **0.9.1** — Extruded Bebas hero, Act 2 archive, Persian type, and framing fixes inside that budget.
- **0.9.2** — Act 2 archive screens and year scale, and the Act 4 shipped spacing.

### Unchanged

- Visuals, 3D scenes, public copy, and layout.

## [0.9.2] - 2026-11-28

### Changed

- Act 2 archive screens no longer sit on a second placard. The site name stays on the screen texture. Each screen is a mini site: PSM Web Developer (dark, amber), Fitness Point (bold), and a warm brewery studio mark.
- Extruded `2016`, `2020`, and `2026` are smaller and sit clear of the code plate, the archive screens, and the stack cards.
- After the Act 4 beams beat, the five robots ease apart so the shipped pose keeps a gap. The crate is 30% smaller. Nameplates sit clear of the robots, the crate, and each other.

## [0.9.1] - 2026-11-28

### Changed

- Act 1 English name is extruded Bebas Neue at `0.06em` tracking (chrome over amber-gold). The accessible heading stays in the page. Persian uses Vazirmatn in that slot. The stray hero slab is gone. The frameless portrait glow occupies the reference arch pose, and `public/portrait/saeed.png` is used only when that file exists.
- Act 2 matches the reference beats: extruded `2016`, `2020` with three archive screens, and gold `2026` over four stack cards. Overlay copy follows the beat in both languages.
- Persian nav chips, pills, eyebrows, and the languages line use Vazirmatn. The Act 5 Persian primary button reads `تأیید و استقرار ✓`.
- Act 4 desktop framing keeps the five cards and nameplates clear of the battery and the build log. Mobile venture slabs sit fully in frame above the placard.
- Draw calls at 1440×900 stay under 150. Act 4 shipped is 145. Act 5 is 127.

### Added

- `public/fonts/bebas-neue.json` (Bebas Neue, OFL) for drei `Text3D`.

## [0.9.0] - 2026-11-28

### Changed

- Act 4 and Act 5 draw calls are under 150. Static robot parts merge per material. Pedestals, beams, eyes, thrusters, and chest LEDs are instanced. The prism no longer renders a transmission pass. Shared segment counts are lower.
- Adaptive DPR: desktop `[1, 1.75]`, mobile `[1, 1.25]`, with `PerformanceMonitor` and `AdaptiveDpr`.
- Act groups and idle nebulae stay hidden outside their clock windows.
- Battery Store placard is `v0.2.0 · 201 PRs` (`v0.2.0 · ۲۰۱ PR` in Persian).
- English chapter labels match the reference HUD. Mobile chips show the number. Tap targets are at least 40px. Lenis does not sync touch.
- Open Graph title is `Saeed Mahjobi — ONE COMMAND`.

### Added

- `docs/QA_REPORT.md` and the frames in `docs/qa-screenshots/`.
- `scripts/qa/measure-draws.mjs` and `scripts/qa/capture.mjs`.

## [0.7.0] - 2026-11-27

### Added

- Act 5 command center on the 44s–52s window (reference internal 23.5–27.5). The amber beam sweeps at 23.45–24.15, then the finale copy locks to Persian RTL.
- Frameless portrait light, gold stage, and the five agents settled on that stage. No arched frame and no face.
- Finale lockup: Bebas Neue at `0.06em` in English, Vazirmatn in Persian. Closing line: `۱۰ سال ساختن، فرماندهی با ۵ ایجنت`.
- Resume downloads for both PDFs, `github.com/psmweb`, and Approve & Deploy. Keyboard focus rings, hover, and active states. Reduced motion skips the beam and shows the settled finale.

### Unchanged

- Acts 1–4, the venture slabs, the robot kit, and the HUD.

## [0.6.0] - 2026-11-27

### Added

- Act 4 command arena in `src/components/scene/acts/Act4Arena.tsx`: five PBR humanoid agents (Frontend, Backend, Executive Manager, UI/UX, Video) on obsidian pedestals, with shared metal, visor, and thruster stock.
- Bilingual role labels and the reference build cards (`PR #201 MERGED`, `886/886 CI TESTS PASSED`, `LIVE · 400K+`, `1,450+ DESIGNS`, `v0.7.0 ✓`), each marked `Live simulation · demo`.
- Ship release v0.8: scroll reaches the beat and plays the drop, the agent reaction, the shipped face, and the celebration. A keyboard-operable Replay control runs it again. Reduced motion rests on the shipped pose with no particle burst.
- Portrait viewports pull the arena camera back and tighten the row so all five figurines stay in frame. Desktop aspect keeps the reference camera.

### Unchanged

- Acts 1–3, the venture slabs, the HUD, and the Act 5 wipe.

## [0.5.0] - 2026-11-27

### Added

- Act 3 ventures 4–6 on the same dark-glass slabs as v0.4.0: Honarmarket, Yadaki Yar, and Sandoq-Yar, with scrolling `honarmarket.png`, `yadaki-yar.png`, and `sandoq-yar.png`.
- Honarmarket placard `1,450+` designs, rose rim with an amber companion light.
- Yadaki Yar placard `v0.7.0 · FastAPI + PostgreSQL · 80 PRs`.
- Sandoq-Yar offline barcode POS, demo barcode `0 123456 789012`, and the Xchange and Rap Historical glass badges.
- Persian placards on the start edge. 3D chips mirror when the page direction is RTL.

### Unchanged

- Ventures 1–3, Acts 1–2, the HUD, Act 4 robots, and the Act 5 wipe.

## [0.1.0] - 2026-11-27

### Added

- Living docs: `AGENTS.md`, `docs/WORK_CONTRACT.md`, `docs/EXECUTION_PLAN.md`, `docs/CATALOG.md`, `docs/VERSIONS.md`, and `docs/VISUAL_PARITY_SPEC.md`.
- Pixel reference, not imported by Next.js: `docs/reference/onecommand3d_main.js` and `docs/reference/onecommand3d_index.html`.
- Bebas Neue as `--font-bebas`, with `.font-hero-display` at `0.06em` tracking. The class is not applied to Act 1 yet.
- Resume PDFs at `public/resume/`, linked from the command-center act in both languages.
- Six venture UI textures at `public/textures/ventures/`.
- Catalog guard now also scans `docs/`, `AGENTS.md`, and `CHANGELOG.md`.

### Not in this release

- Scroll-linked camera, PBR figurines, and act visuals. Those are v0.2.0 through v0.7.0.
- The frameless studio portrait. The rule is locked. The file is not in the repo.

## [0.2.0] - 2026-11-27

### Added

- Obsidian deep-space atmosphere from the reference scene: `#05070C` backdrop, exponential fog, starfield, per-chapter nebulae, dot-grid floors, and the key / rim / fill rig.
- Cinema camera bound to Lenis scroll. Document progress `0–1` maps to the `0–52s` presentation clock, then into the reference curve.
- Persistent HUD: glass navbar with `SM`, chapter chips `01`–`05`, and `EN | فارسی`; a vertical battery that fills with scroll and flips edge in RTL; a one-line frosted build log.

## [0.4.0] - 2026-11-27

### Added

- Act 3 ventures 1–3 in `src/components/scene/acts/Act3Ventures.tsx`: dark-glass slabs for Mikham + Miara, Battery Store, and Trader Bot, on the reference camera windows, with scrolling UI textures.
- Battery Store energy cells lit emerald and amber. Trader Bot wireframe telemetry lit cyan and emerald. Live trading stays off, disarmed by default.
- Bilingual placards in `src/components/acts/Act3VentureOverlay.tsx`, synced to the 0–52s clock and mirrored in Persian.
- Quiet glass placeholders for ventures 4–6 so the rest of the timeline still scrolls.
- Corrected the swapped `battery-store.png` and `trader-bot.png` plates so each filename matches that product’s UI.

### Unchanged

- Act 4 robots and the Act 5 wipe remain later phases.

## [0.3.0] - 2026-11-27

### Added

- Act 1 hero and command: Bebas Neue display name, Persian name in Vazirmatn, role line, typing terminal, status pills, frameless portrait slot, and the amber storyteller gem.
- Act 2 evolution: 2016, 2020, and 2026 glass monoliths, a clean studio mark, and floor beams from 2016 to 2026, with bilingual overlay copy.

### Unchanged

- Act 3 venture stages, Act 4 robots, and the Act 5 wipe are still later phases.


