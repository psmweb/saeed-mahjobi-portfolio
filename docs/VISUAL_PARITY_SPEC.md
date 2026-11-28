# Visual parity spec

Source of truth for the later visual build: `docs/reference/onecommand3d_main.js` and `docs/reference/onecommand3d_index.html`. Those files are reference only. Next.js must not import them.

The reference clock runs 0–28 seconds. Progress below is `t / 28`.

## Design tokens

| Token | Hex |
| --- | --- |
| Obsidian | `#05070C` |
| Amber | `#F59E0B` |
| Emerald | `#10B981` |
| Cyan | `#38BDF8` |

## Hero title

Bebas Neue, weight 400, tracking `0.06em`.

```css
.font-hero-display {
  font-family: var(--font-bebas), sans-serif;
  letter-spacing: 0.06em;
}
```

`--font-bebas` is set on `<html>` by `next/font`. The class stays Bebas Neue in both LTR and RTL. Apply it in Phase 2. Do not apply it during Phase 0.

## Portrait

Frameless studio portrait. No arched frame, no gold monolith around the photo. Do not redraw or retouch the face. The file is not in `public/images/` yet. Until it arrives, the page keeps the monogram fallback.

## Five-act scroll map

From `camRaw` in the reference script.

| Act | Reference clock | Progress | What the camera does |
| --- | --- | --- | --- |
| 01 Command | 0.0–4.0 | 0.00–0.14 | Move from the wide start into the hero, then a short push |
| Transition | 4.0–5.0 | 0.14–0.18 | Curve toward the storyteller |
| 02 Evolution | 5.0–9.7 | 0.18–0.35 | Arc around the archive |
| Bridge | 9.7–10.15 | 0.35–0.36 | Hand off into the first venture |
| 03 Ventures | 10.15–17.55 | 0.36–0.63 | Six stages, then the exit arc |
| 04 Agents | 18.1–23.5 | 0.65–0.84 | Arena orbit around the five figurines |
| 05 Deploy | 23.5–28.0 | 0.84–1.00 | Wipe into the command center |

Chapter labels in the reference HUD: `01 COMMAND`, `02 EVOLUTION`, `03 VENTURES`, `04 AGENTS`, `05 DEPLOY`.

## Six venture stages

Order and accent colors from the reference placards. The scrolling UI plates live in `public/textures/ventures/` as 1024×2304 WebP. The filename hash is the first 8 hex characters of the file's SHA-256. Current URLs are in `src/data/ventureTextures.ts`. `npm run optimize:textures` rebuilds them from the 1600×3600 PNGs in git history. The crop matches the old plates because both sizes are 4:9.

| Stage | Product | Accent | Texture |
| --- | --- | --- | --- |
| 01 | Mikham + Miara | `#F59E0B` | `mikham-344b77c6.webp` |
| 02 | Battery Store | `#38BDF8` | `battery-store-46d7005c.webp` |
| 03 | Trader Bot | `#10B981` | `trader-bot-7dad712e.webp` |
| 04 | Honarmarket | `#F472B6` | `honarmarket-16335853.webp` |
| 05 | Yadaki Yar | `#60A5FA` | `yadaki-yar-4d0b03c2.webp` |
| 06 | Sandoq-Yar | `#2DD4BF` | `sandoq-yar-885be780.webp` |

Xchange and Rap Historical stay badges on the Sandoq-Yar stage in the reference HUD. They are not a seventh slab.

## Five PBR robot figurines

From `ROLES` in the reference script. Phase 4 replaces the capsule skeletons with these.

| Role | Color | Prop |
| --- | --- | --- |
| Frontend | `#38BDF8` | frame |
| Backend | `#10B981` | server |
| Executive Manager | `#F59E0B` | halo |
| UI/UX | `#A78BFA` | prism |
| Video | `#FB923C` | lens |

Materials to match later: obsidian body, chrome, brushed metal, amber gem, iridescent visor. Any clickable or scroll-triggered task on this stage carries `Live simulation · demo`.
