# Master Portfolio Catalog — Saeed Mahjobi

**Audit date:** 27 November 2026 (UTC+03:30)  
Timezone labels in this copy use UTC+03:30. The internal ChatBot owner slug is withheld.

**Purpose:** A complete, verified list of distinct products and work samples for Saeed to approve **before** the live portfolio site is built.  
**Method:** GitHub metadata and file contents were read with `cursor-github` tools only (no clones). Non-GitHub ventures come from `/workspace/saeed-resume/research-dossier.md`. The 2020–2021 archive was read from `/workspace/saeed-resume/legacy-portfolio-2020/`.  
**Rule:** Nothing below is estimated. If a metric, URL, or feature was not read in a repo or in the dossier, it is not claimed. Dates from GitHub (`created_at`, `pushed_at`) are converted from UTC to **UTC+03:30**.

### How to read this catalog

- **Proposed public blurb** is the only copy intended for the site. It contains no country, city, province, or local-currency names, and it never uses the ChatBot repo owner slug.
- **Internal audit notes** are for Saeed and the build team only (repo slugs, relationships, cleanup flags).
- **Recommended tier** is a suggestion, not a decision. Saeed’s approval is required before anything is built.

### Recommended portfolio shape (for approval)

Show these as distinct public projects:

1. **Mikham** (flagship) — include **Miara** as its AI assistant, not as a separate case study.
2. **Battery Store** (flagship) — current `batterystore` rebuild only.
3. **Trader Bot** (flagship).
4. **Honarmarket** (flagship, live store, no GitHub repo in this audit).
5. **Yadaki Yar** (active product; lives inside `psmweb/sandoq-yar`).
6. **Sandoq-Yar** (active product; same repo, separate app).
7. **Xchange** (earlier / related product — one card, not three repos).
8. **Rap Historical** (media venture).
9. **2020 archive** — PSM Web Developer hub, Fitness Point, and the brewery site, after logo/copy cleanup.

Do **not** give separate public cards to: `battery24`, `b24`, `exchange`, `xchange-fix`, `psmwebdesign`, or the ChatBot repo slug.

---

## 1. Flagship Ventures

### 1.1 Mikham — میکهام

| Field | Verified fact |
|---|---|
| **Names** | EN: Mikham. FA: میکهام. Live site: [https://mikham.me](https://mikham.me) |
| **Repos** | Product overlay: `psmweb/mikham-custom` (private). AI assistant backend: repo slug listed only in Internal notes. |
| **What it does** | A business directory and map, plus online administrative services. A custom Laravel/PHP overlay (`Frontend/custom`) ships beside a licensed AsanYab core as signed `custom-vX.Y.Z` releases, with backup and rollback. |
| **Tech stack (from the overlay repo)** | PHP / Laravel overlay; Livewire is present under `Frontend/custom/Livewire`. Modules on disk include Growth, UiV2, Miara, Network, Pro, Zone, Advertising, Identity, and Release, plus documented Nearby SMS and Site Builder work. SEO/GEO notes in the repo cover eleven `GROWTH_SEO_*` flags, `robots.txt`, `llms.txt`, and sitemaps. |
| **Scale / signals** | Overlay repo created **27 Nov 2026, 02:24 UTC+03:30**; last push **27 Nov 2026, 20:38 UTC+03:30**. Language: PHP. Default branch: `main`. README documents releases `custom-v1.32.0` through `custom-v1.32.3`. Dossier (Search Console) confirms Saeed is verified **siteOwner** of `https://mikham.me/`. Dossier (transcript, not re-counted in the repo) also records listing tallies of 412,536 businesses (165,337 with photos) and another measurement of 458,958 listings, across 13 main categories. Use those counts only if Saeed still wants them, and never with geographic wording. |
| **Recommended tier** | **Flagship Venture** |
| **Proposed public blurb (EN)** | Mikham is a live business directory and map with online administrative services. Saeed owns the custom product layer: growth and SEO work, a redesigned UI, advertising, a site builder, and the Miara assistant that helps businesses register only after an explicit confirmation. |
| **Proposed public blurb (FA)** | میکهام یک فهرست و نقشهٔ زندهٔ کسب‌وکارهاست، به‌همراه خدمات اداری آنلاین. سعید لایهٔ سفارشی محصول را ساخته: رشد و سئو، رابط کاربری بازطراحی‌شده، تبلیغات، سایت‌ساز، و دستیار میارا که ثبت کسب‌وکار را فقط بعد از تأیید صریح انجام می‌دهد. |

**Internal audit notes**

- Treat **Miara** as part of Mikham, not a second flagship (see 1.1a).
- The overlay README describes the product in geographically specific terms. Strip that language from all public copy.
- The overlay contains a folder named after a specific economic zone. Do not name that zone, or any city or region, on the public site unless Saeed later approves a carefully worded, non-geographic description.
- Dossier mentions a later release `custom-v1.32.5` from a transcript; the overlay README read in this audit stops at `custom-v1.32.3`. Confirm the public release number with Saeed before printing it.

#### 1.1a Miara — میارا (Mikham AI assistant; merge into Mikham)

| Field | Verified fact |
|---|---|
| **Names** | EN: Miara (Mikham AI assistant / MikhamChatBot). FA: میارا. |
| **What it does** | A conversational assistant that helps register businesses on Mikham. It keeps a listing draft, infers missing details, and submits to the importer only after a final summary and explicit confirmation. The backend is a state machine (`collecting_required` → `enriching_optional` → `awaiting_final_confirmation` → `submitted` / `cancelled`). |
| **Tech stack (from the ChatBot README and `requirements.txt`)** | FastAPI, Uvicorn, OpenAI Python SDK (OpenAI-compatible provider, settings via env only), Pydantic, Redis, Streamlit demo UI, httpx. Categories are resolved against Laravel (`POST /categories-search`), not hardcoded in Python. Importer calls use an Idempotency-Key. A versioned bilingual structured-understanding pipeline and a golden-dataset evaluator live under `tests/` and `benchmarks/`. |
| **Scale / signals** | Repo created **9 Jul 2026, 07:20 UTC+03:30**; last push **24 Nov 2026, 15:27 UTC+03:30**. GitHub language label: PHP (the same repo also holds Laravel/Frontend trees and Mikham planning docs). Pull requests exist through **#332**. Open issues: 5. A redesign of Miara is noted as in progress in the README (master plan under `docs/plans/`). |
| **Recommended tier** | **Exclude / Merge** into the Mikham flagship card (show as the AI assistant, not a separate product). |
| **Proposed public blurb (EN)** | Miara is Mikham’s registration assistant: a FastAPI state machine that drafts a listing and calls the importer only after the user confirms. |
| **Proposed public blurb (FA)** | میارا دستیار ثبت کسب‌وکار در میکهام است: یک ماشین حالت با FastAPI که پیش‌نویس آگهی را می‌سازد و فقط بعد از تأیید کاربر آن را ثبت می‌کند. |

**Internal audit notes**

- Internal repo slug: the withheld ChatBot repository. Public copy must use only the product name **Miara** (or “Mikham AI assistant”). Never show the owner slug or any other personal name.
- This repo is a broader workspace than the Python assistant alone (Laravel/Frontend, design docs, audio fixtures). The dedicated overlay now lives in `psmweb/mikham-custom`.

---

### 1.2 Battery Store — فروشگاه باتری

| Field | Verified fact |
|---|---|
| **Names** | EN: Battery Store. FA: فروشگاه باتری. No public production URL was found in the repo. |
| **Repo** | Current product: `psmweb/batterystore` (private). Earlier related repos: see §3. |
| **What it does** | A specialist shop for car, motorcycle, and heavy-vehicle batteries. The current rebuild is a pnpm monorepo with a customer storefront, an admin panel, and an API. Catalog data includes voltage, amp-hours, CCA, dimensions, and terminals, plus vehicle fitment, inventory, OTP login, and admin/operator roles. The README states the stack is local-only until CEO approval of milestone M1 (no cloud staging in that phase). |
| **Tech stack (from root and app `package.json` files and README)** | pnpm `10.33.4` workspace, Node `>=22`, Turbo `2`. Apps: `@batterystore/web` (Next.js `^15.5.6`, React `^19.2`, Tailwind CSS `^3.4`, Vazirmatn, Embla carousel), `@batterystore/admin` (Next.js `^15.5.6`, React `^19.2`, Tailwind), `@batterystore/api` (NestJS `^10.4`, Prisma `^6.18`, PostgreSQL, Redis via `ioredis`, JWT, WebSockets, scheduled tasks). Shared packages: `@battery-store/seo`, `@batterystore/shared-types`, `@batterystore/ui`, `@batterystore/fe-product-qa`. Docker Compose, Vitest, Playwright, Commitlint / Conventional Commits, module-boundary lint. Root version: **0.2.0**. |
| **Scale / signals** | Created **12 Nov 2026, 19:43 UTC+03:30**; last push **27 Nov 2026, 21:07 UTC+03:30**. Language: TypeScript. Default branch: `main`. More than 100 feature branches were listed (a second page of branches exists). Pull requests exist through **#201** (latest read: a closed docs handoff that updates the project through PR #200). Open issues: 2. Three apps + four packages. |
| **Recommended tier** | **Flagship Venture** (show only this rebuild, not the earlier WordPress repos). |
| **Proposed public blurb (EN)** | Battery Store is a specialist battery shop rebuilt as a TypeScript monorepo: a Next.js storefront, a Next.js admin, and a NestJS API with Prisma, PostgreSQL, and Redis. It supports vehicle fitment, inventory, OTP login, and structured product specs. |
| **Proposed public blurb (FA)** | فروشگاه باتری یک فروشگاه تخصصی باتری است که به‌صورت مونورپوی TypeScript بازسازی شده: فروشگاه و پنل با Next.js، و API با NestJS، Prisma، PostgreSQL و Redis. تناسب با خودرو، موجودی، ورود یک‌بارمصرف و مشخصات فنی باتری را پوشش می‌دهد. |

**Internal audit notes**

- Storefront is Persian RTL (Vazirmatn). Source README and seed data use local-currency wording. Keep all of that out of public copy.
- Earlier WordPress / XAMPP repos must not be presented as the current product (see §3.1–3.2).

---

### 1.3 Trader Bot — ربات معامله‌گر

| Field | Verified fact |
|---|---|
| **Names** | EN: Trader Bot / Trading Bot v2. FA: ربات معامله‌گر. No public production URL was found. |
| **Repo** | `psmweb/trader_bot` (private). Current code lives in `trading_bot_v2/`; `trading_bot_v1/` is also in the tree. |
| **What it does** | An algorithmic trading system with a plugin architecture, event-driven backtesting (RSI, MACD, and combo strategies), paper trading, and a bilingual (FA/EN) Flask dashboard with two desks: trader (`/monitor`) and owner (`/owner`). Live trading from the dashboard stays disabled; a check in a recorded PR run asserts `LIVE_TRADING_ARMED` is false. |
| **Tech stack (from `trading_bot_v2`)** | Python `>=3.11`. Core: aiohttp, Pydantic, SQLAlchemy, aiosqlite, Redis, NumPy, Pandas, python-telegram-bot (declared in `pyproject.toml`), Prometheus, Flask + Flask-Babel + Flask-SocketIO + Plotly for the dashboard. Backtester adds event matching, fee/slippage models, walk-forward analysis, and optional Optuna. Docker Compose, pytest, Ruff, mypy, pre-commit. Package version in `pyproject.toml`: **2.0.0**. |
| **Scale / signals** | Created **22 Aug 2025, 22:22 UTC+03:30**; last push **11 Nov 2026, 19:25 UTC+03:30**. Language: Python. Default branch: `main`. Pull requests exist through **#144**. Open issues: 0. PR #144 (closed) reports a local gate of **886 passed**, 0 failed, 1 xfailed, 11 deselected, 54% coverage, and 11 plugins. Dossier also reports ~50K lines of Python and a two-week merge burst of PRs #48–#134; those line counts were not re-counted in this audit. |
| **Recommended tier** | **Flagship Venture** |
| **Proposed public blurb (EN)** | Trader Bot is a Python trading platform with a plugin architecture, event-driven backtesting, paper trading, and bilingual owner and trader dashboards. Live trading stays disarmed until it is explicitly enabled. |
| **Proposed public blurb (FA)** | ربات معامله‌گر یک پلتفرم معاملاتی پایتون است با معماری افزایشی، بک‌تست رویدادمحور، معاملهٔ آزمایشی، و دو داشبورد دوزبانه برای مالک و معامله‌گر. معاملهٔ واقعی تا روشن‌شدن صریح، غیرفعال می‌ماند. |

**Internal audit notes**

- v2 README names a specific market-data venue and example symbols. Do not put venue names or a “target market” geography on the public site unless Saeed asks for them.
- The v2 README still contains placeholder clone URLs and support addresses (`tradingbot/trading-bot-v2`, `support@tradingbot.com`). Those are not verified public contacts. Do not publish them.
- Dossier slogan “learn and trade automatically” was not re-read as a literal string in the v2 README during this audit; confirm before using it.

---

### 1.4 Honarmarket — هنربازار

| Field | Verified fact |
|---|---|
| **Names** | EN: Honarmarket. FA: هنربازار. Live site: [https://honarmarket.com](https://honarmarket.com) |
| **Repo** | None among the 11 GitHub repositories audited. Source: research dossier. |
| **What it does** | An online art-supplies store. The dossier records 1,450+ acetate mold designs, plus silicone molds, candle-making supplies, paraffin, resin, and stone powder. Saeed has described it as his site and has asked for a modern, minimal UI/UX redesign. |
| **Tech stack** | Not verified in a GitHub repo in this audit. Do not invent a stack. |
| **Scale / signals** | 1,450+ acetate mold designs (dossier). No verified start date, revenue, or traffic. |
| **Recommended tier** | **Flagship Venture** (live business; visually important to the amber/resin concept). |
| **Proposed public blurb (EN)** | Honarmarket is Saeed’s live art-supplies store, with 1,450+ acetate mold designs plus silicone molds, candle-making supplies, paraffin, resin, and stone powder. |
| **Proposed public blurb (FA)** | هنربازار فروشگاه زندهٔ لوازم هنری سعید است، با بیش از ۱٬۴۵۰ طرح قالب استات و همچنین قالب سیلیکونی، مواد شمع‌سازی، پارافین، رزین و پودر سنگ. |

**Internal audit notes**

- A promotional credit campaign mentioned in the dossier uses local-currency wording. Do not put that campaign, or any currency name, in public copy.
- Confirm current catalog numbers with the live site before lock-in, if Saeed wants the “1,450+” figure on the page.

---

## 2. Additional Active Products

### 2.1 Sandoq-Yar — صندوق‌یار (supermarket checkout assistant)

| Field | Verified fact |
|---|---|
| **Names** | EN: Sandoq-Yar. FA: صندوق‌یار. PWA manifest name/short_name: صندوق‌یار. Description in the manifest: «دستیار آفلاین صندوق سوپرمارکت». |
| **Repo / path** | `psmweb/sandoq-yar` → `v1/` (`v1/frontend`, `v1/backend`). Shared repo with Yadaki Yar. |
| **What it does** | An offline supermarket checkout assistant. Version 1 is an installable Android Chrome PWA: barcode scanning, product entry and search, invoice-photo capture (AI extract is wired but off by default), and a product list stored in IndexedDB, without a day-to-day network dependency. |
| **Tech stack** | Vanilla HTML/CSS/JS PWA (service worker `sandoq-yar-v2`, local Vazirmatn, vendored `zxing-wasm` 3.1.7, `BarcodeDetector` when available). Backend: FastAPI `0.121.2` + Uvicorn `0.38.0` serving the frontend and `GET /health`; `POST /ai/extract` returns 503 while AI is disabled. Data store: IndexedDB (`sandoq-yar` / `products`). |
| **Scale / signals** | Parent repo created **20 Nov 2026, 00:34 UTC+03:30**; last push **27 Nov 2026, 13:15 UTC+03:30**. Repo language: Python. About **75** branches were listed (one page, `per_page=100`). Pull requests exist through **#80**. Open issues: 7. This path is a working v1 prototype (screens: welcome, home, continuous scan, price entry, invoice review, product list). |
| **Recommended tier** | **Active Product** (its own card, clearly separate from Yadaki Yar). |
| **Proposed public blurb (EN)** | Sandoq-Yar is an installable offline checkout assistant for supermarkets: scan a barcode, keep the catalog on the phone, and capture invoices — even without a network connection. |
| **Proposed public blurb (FA)** | صندوق‌یار یک دستیار صندوقِ قابل‌نصب و آفلاین برای سوپرمارکت است: اسکن بارکد، نگهداری فهرست کالا روی گوشی، و ثبت فاکتور — حتی بدون اتصال شبکه. |

**Internal audit notes**

- Source UI copy uses local-currency wording. Keep it out of public blurbs.
- `super/` in this repo is not a second supermarket app; it currently holds the Yadaki Yar planning package only.

---

### 2.2 Yadaki Yar — یدکی‌یار (auto-parts accounting / POS)

Saeed confirmed that Yadaki Yar lives inside `psmweb/sandoq-yar`. That is verified on disk.

| Field | Verified fact |
|---|---|
| **Names** | EN: Yadaki Yar. FA: یدکی‌یار. |
| **Repo / paths** | `psmweb/sandoq-yar`: implementation in `v1-yadaki/` (version file **0.7.0**, dated 25 Nov 2026 in the changelog); planning/design package in `super/yadaki-yar/`. Many `yadaki/` and `yadaki-yar-*` branches exist. |
| **What it does** | A full accounting system for auto-parts shops — not only a phone app. A shared backend is intended to serve Windows and Android frontends (Flutter was explicitly rejected). It is designed as an offline-capable shop system with a three-layer idea (central server, always-on local PC, short-term device cache), double-entry ledger, stock movements, purchasing and supplier payments, role-based access (manager, cashier, warehouse, accountant), and scheduled PostgreSQL backups. First real test is planned in the shop itself; selling the product waits until inventory and the database are complete. Budget, time-to-sale, and pricing are explicitly not set yet. |
| **Tech stack (from `v1-yadaki/server`)** | FastAPI `0.165.0`, Uvicorn `0.54.0`, SQLAlchemy `2.1.9`, PostgreSQL via psycopg `3.3.9`, Alembic `1.20.1`, httpx, argon2-cffi, cryptography, segno. Modules on main: `audit`, `auth`, `backup`, `catalog`, `ledger`, `purchasing`, `stock`, `system`. CI workflow `yadaki-server.yml` runs Ruff and pytest against **PostgreSQL 16**. Frontend on `main` currently includes the login experience under `v1-yadaki/frontend/login` (auth also exists under `v1-yadaki/backend/`). A `demo/` folder lives in the planning package. |
| **Scale / signals** | Same parent-repo dates as Sandoq-Yar (created **20 Nov 2026, 00:34 UTC+03:30**; last push **27 Nov 2026, 13:15 UTC+03:30**). Version **0.7.0**. The planning README on `main` records **167** numbered decisions plus 5 unnumbered ones. Changelog 0.7.0 and open PR **#80** (handoff file, not merged) refer to decisions through **179** — confirm the public decision count with Saeed. PR #80 also refers to a J1–J14 status table. |
| **Recommended tier** | **Active Product** (strong enough that Saeed may later promote it to flagship; not a merge with Sandoq-Yar). |
| **Proposed public blurb (EN)** | Yadaki Yar is a full accounting and checkout system for auto-parts shops, with a shared backend for Windows and Android, an offline-capable shop setup, stock, purchasing, a double-entry ledger, and role-based access. |
| **Proposed public blurb (FA)** | یدکی‌یار نرم‌افزار کامل حسابداری و صندوق برای فروشگاه لوازم یدکی است، با بک‌اند مشترک برای ویندوز و اندروید، کار آفلاین در مغازه، انبار، خرید، دفتر روزنامهٔ دوطرفه، و دسترسی مبتنی بر نقش. |

**Internal audit notes**

- Amounts in the database are stored in a local currency unit with a display switch. Never use those currency names in public copy.
- Login/SMS and some update/backup features are behind default-off switches until after the first shop test.
- Do not publish budget, pricing, or “time to market” figures; the docs say none are set.

---

### 2.3 Rap Historical — رپ هیستوریکال

| Field | Verified fact |
|---|---|
| **Names** | EN / FA: Rap Historical. Channel: **@RapHistorical**. |
| **Repo** | None among the 11 GitHub repositories. Source: research dossier. |
| **What it does** | A YouTube channel of Shorts about hip-hop history, produced with AI 3D animation, voice-over, and captions. |
| **Tech stack** | Production method (dossier): AI 3D animation, voice-over, captions. No application repo was audited. |
| **Scale / signals** | Dossier: top Short about **4.6K** views. No subscriber count was in the dossier excerpt used here. |
| **Recommended tier** | **Active Product** / media venture (one card, not a software case study of the same weight as Mikham or Battery Store). |
| **Proposed public blurb (EN)** | Rap Historical is Saeed’s YouTube channel of short films about hip-hop history, made with AI 3D animation, voice-over, and captions. |
| **Proposed public blurb (FA)** | رپ هیستوریکال کانال یوتیوب سعید با فیلم‌های کوتاه دربارهٔ تاریخ هیپ‌هاپ است، ساخته‌شده با انیمیشن سه‌بعدی هوش مصنوعی، گویندگی و زیرنویس. |

---

## 3. Earlier Iterations / Related Repos

These should not get their own public cards. They are listed so the portfolio stays accurate and sharp.

### 3.1 `psmweb/battery24` — earlier Battery Store WordPress environment

| Field | Verified fact |
|---|---|
| **What it is** | Repo description: “battery shop store wordpress project.” The tree is a full WordPress core with `wp-admin`, `wp-includes`, `wp-content`, and `wp-config.php`. The README describes a Docker WordPress + MySQL + phpMyAdmin local environment. |
| **Tech stack** | WordPress, PHP, MySQL (as described in the README). Themes present: only the default **Twenty Twenty-Three**, **Twenty Twenty-Four**, and **Twenty Twenty-Five**. Plugins present: only default **Akismet** and **Hello Dolly**. No custom theme or shop plugin was found in `wp-content`. |
| **Dates** | Created **16 Sep 2025, 18:19 UTC+03:30**; last push the same day at **19:06**. Language: PHP. Branch: `master`. |
| **Recommended tier** | **Archive / Earlier Iteration** of Battery Store. Do not show it as a custom shop, because this tree is a stock WordPress install. |

### 3.2 `psmweb/b24` — not a product

| Field | Verified fact |
|---|---|
| **What it is** | Repo description: “battery.” The root is an **Apache Friends / Bitnami XAMPP dashboard** (`applications.html` title “Bitnami: Open Source. Simplified”, plus `loader-wizard.php`, `dashboard/`, `xampp/`, `secure_login/`). It is a local-stack dump, not an application Saeed designed. |
| **Dates** | Created **30 Sep 2025, 15:44 UTC+03:30**; last push **16:48** the same day. Language: HTML. |
| **Recommended tier** | **Exclude** from the portfolio. |

### 3.3 Xchange — صرافی (one product, three repos)

Treat **Xchange** as a single earlier product: a web exchange / treasury desk for currencies (and later gold, silver, and crypto), with cash transfers, cheque payment fields, printable receipts, Jalali/Gregorian dates, and a PWA front end.

| Repo | Role | Dates (UTC+03:30) | Stack / signals | Tier |
|---|---|---|---|---|
| `psmweb/exchange` | First Next.js front end only. Repo description (FA): a web-based exchange with Nuxt, React, and Next — the tree itself is **Next.js 15.3.5**, React 19, MUI 7, Tailwind 4, next-intl, Emotion, RTL (`stylis-plugin-rtl`). Routes include `/`, `/login`, and `/dashboard`. Root README is still the default create-next-app text. | Created **6 Aug 2025, 10:42**; last push **19 Aug 2025, 12:48**. | TypeScript. | **Archive / Earlier Iteration** — merge into the Xchange card as “first front-end.” |
| `psmweb/xchange` | Main build: `nextjs/` + `laravel/`. Front end as above, plus Redux Toolkit, TanStack Query, MUI X charts/data-grid/date-pickers, next-pwa, date-fns-jalali, jsPDF, xlsx. Back end: **Laravel 12**, PHP `^8.2`, Laravel Sanctum, PHPUnit. Docs cover gold/silver (`XAU`/`XAG`) as a currency kind, cheque receipts, and cash transfers. PRs through **#112**. Open issues: 9. | Created **19 Aug 2025, 13:18**; last push **23 Sep 2025, 11:56**. | TypeScript / PHP. | Use this plus `xchange-fix` as the product source; one public card. |
| `psmweb/xchange-fix` | Later snapshot described as “xchange fix.” Same `laravel/` + `nextjs/` layout, plus `DATABASE_SCHEMA_DOCUMENTATION.md`. Default branch: `complete-project-upload` (also `main`, `backend`, `work-on-users`, and related branches). | Created **22 Oct 2025, 13:17**; last push **15:42** the same day. | TypeScript. | **Exclude / Merge** into the Xchange card as the later complete upload. |

**Proposed public blurb (EN):** Xchange is a web exchange desk for currencies, precious metals, and crypto, with cash transfers, cheque payments, printable receipts, and a bilingual PWA front end on Next.js and Laravel.  
**Proposed public blurb (FA):** ایکس‌چنج یک میز صرافی تحت وب برای ارز، فلز گرانبها و رمزارز است، با انتقال نقدی، پرداخت با چک، رسید چاپی، و رابط PWA دوزبانه روی Next.js و Laravel.

**Internal audit notes**

- Last activity is late 2025, so this is not a current flagship unless Saeed says it is still being developed.
- `cookies.txt` files are committed in the xchange trees. Do not publish them; they should be removed from the repos. Their contents were not read for this catalog.
- No public production URL was found.

### 3.4 `psmweb/psmwebdesign` — empty placeholder

| Field | Verified fact |
|---|---|
| **What it is** | Public repo, **empty** (GitHub: “This repository is empty.” Size 0, no language). Created and pushed **20 Jan 2021, 10:38 UTC+03:30** — the day after the `psmweb` account was created (dossier: account created 19 Jan 2021). |
| **Recommended tier** | **Exclude**. The 2020 static portfolio already covers the PSM Web Developer era. |

---

## 4. 2020 Archive (non-GitHub work samples)

Source: `/workspace/saeed-resume/legacy-portfolio-2020/` (and the related `work-samples/` copy). The hub footer reads “© PSM WEB DESIGN.LLC All right reserved **2020**.” Stack claimed and present: HTML, CSS, **Bootstrap 4.3.1**, **jQuery**, **Owl Carousel 2.3.4**, and SASS (named in the services copy).

### 4.1 PSM Web Developer — پی‌اس‌ام وب دولوپر (hub + inner portfolio)

| Field | Verified fact |
|---|---|
| **What it is** | Saeed’s 2020 personal/agency portfolio. Hub title: `PsmWebDesign`. Hero: “PSM WEB DEVELOPER.” Inner project at `assets/works/portfolio/` is a one-page creative studio layout (“A Creative On Page,” website design, product branding, SEO marketing). |
| **Tech** | Bootstrap 4.3.1, jQuery, Owl Carousel, SASS (as stated on the hub). |
| **Recommended tier** | **Archive** — use as the “origin story” piece, after cleanup. |
| **Cleanup required** | Inner page contains geographically specific founding copy that **must not** appear on the public site. Third-party **sponsor logos** are present (`sposnors-logo-1.png` through `sposnors-logo-5.png`). Placeholder names (“Michel Gerner”, “Michel Jacson”) should not be presented as real team members. |

### 4.2 Fitness Point — فیتنس پوینت

| Field | Verified fact |
|---|---|
| **What it is** | A gym / fitness marketing site in the 2020 works folder (`assets/works/gymwebsite/`). On-page name: **FITNESS POINT**. |
| **Tech** | Same 2020 front-end stack (Bootstrap 4, jQuery, etc.). |
| **Recommended tier** | **Archive** |
| **Cleanup required** | Stock fitness photographs (filenames include wallpaper/preview and generic bodybuilder assets). Earlier review also flagged a cart/price bar that should stay cropped or be removed. Do not present stock imagery as original photography. |

### 4.3 Brewery site (folder: `bearwebsite`) — سایت نوشیدنی

| Field | Verified fact |
|---|---|
| **What it is** | A multi-page brewery/beer marketing site (`assets/works/bearwebsite/`: `index.html`, `about-us.html`, `store.html`, `visit-us.html`, and others). Page title: “Beer Website/index.” Copy includes beer lists such as Brooklyn Lager, Bel Air Sour, and East IPA, plus “Brooklyn Gives Back” and a “Michael Jackson Foundation” heading. |
| **Tech** | Bootstrap 4.3.1, jQuery, Owl Carousel 2.3.4. |
| **Recommended tier** | **Archive** — show as an early layout/front-end study, not as a real brand Saeed owns. |
| **Cleanup required** | **Third-party brand logos and beer names** (logo files under `assets/images/logo/`, plus Brooklyn beer copy). These must be replaced or clearly framed as a student/practice redesign before any public use. |

No other 2020 project folders were present in `legacy-portfolio-2020/assets/works/` besides `bearwebsite`, `gymwebsite`, `portfolio`, and `worksimg`.

---

## 5. Suggested public set vs. excluded set

### Show (after Saeed’s approval)

| Public name | Tier | Source |
|---|---|---|
| Mikham (with Miara) | Flagship | `psmweb/mikham-custom` + Miara backend; live `mikham.me` |
| Battery Store | Flagship | `psmweb/batterystore` only |
| Trader Bot | Flagship | `psmweb/trader_bot` (`trading_bot_v2`) |
| Honarmarket | Flagship | Live `honarmarket.com` (dossier; no repo in this audit) |
| Yadaki Yar | Active Product | `psmweb/sandoq-yar` / `v1-yadaki` + `super/yadaki-yar` |
| Sandoq-Yar | Active Product | `psmweb/sandoq-yar` / `v1` |
| Xchange | Earlier iteration (one card) | Prefer `xchange` + `xchange-fix` as source; mention `exchange` only as the first front end |
| Rap Historical | Media venture | `@RapHistorical` (dossier) |
| PSM Web Developer, Fitness Point, Brewery study | 2020 archive | `legacy-portfolio-2020/` after cleanup |

### Do not show as separate work

| Item | Why |
|---|---|
| `psmweb/battery24` | Stock WordPress environment; earlier Battery Store attempt |
| `psmweb/b24` | XAMPP/Bitnami dashboard dump, not a designed product |
| `psmweb/exchange` as its own card | First front end of Xchange |
| `psmweb/xchange-fix` as its own card | Later complete upload of Xchange |
| `psmweb/psmwebdesign` | Empty 2021 placeholder |
| ChatBot repo slug / any other personal name | Public name is **Miara**, inside Mikham |

---

## 6. Open questions for Saeed (do not guess)

1. Confirm the **public set** above — especially whether Yadaki Yar should sit beside the flagships, and whether Xchange should appear at all.
2. Confirm the **Mikham listing counts** (dossier figures were not re-counted from the live site in this audit) and the public release number (`custom-v1.32.3` in the overlay README vs. a later number mentioned in the dossier).
3. Is there a **public URL** for Battery Store, Sandoq-Yar, Yadaki Yar, Trader Bot, or Xchange? None was found in the repos.
4. For Honarmarket, should the site use the **1,450+** figure after a fresh check of the live catalog?
5. For the 2020 brewery and Fitness Point sites: approve **cleanup** (third-party logos, stock photos, geographic copy) before any public embed.
6. Decision count for Yadaki Yar: **167** (planning README on `main`) vs. **179** (changelog / open handoff PR). Which number, if any, should appear publicly?

---

*End of audit. No portfolio page should be built until Saeed approves this list and the proposed public blurbs.*
