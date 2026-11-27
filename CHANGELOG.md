# Changelog

All notable changes to this portfolio are documented here. The format follows Keep a Changelog. Versions follow Semantic Versioning.

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


