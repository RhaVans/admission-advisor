# Admission Advisor — System Context

> This document provides full operational context for the Admission Advisor platform.  
> Read this before touching any file in `J:\PROJECT ANALYST\uni-advisor`.

---

## What This App Does

**Admission Advisor** is a full-stack analytical platform that helps Indonesian high school students identify which **Sarjana (S1) university programs** they have the highest chance of being admitted to via the **Jalur Mandiri** (independent admission pathway).

It covers **5 top national universities**: UGM, UI, ITB, ITS, and UNPAD.

For each university, the system:
1. Attempts to scrape live admissions data from official portals
2. Falls back to affiliated educational platforms if official scraping fails
3. Falls back to curated JSON datasets as the last resort
4. Calculates an **Ease Score** for every program (composite of acceptance rate, minimum passing score, and score trend)
5. Recommends the **top 2 easiest programs** to get into at the lowest possible score
6. Displays all data transparently with source citations in the **Data Archives** section

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js v18+ |
| Server | Express.js |
| Scraping | Playwright (headless Chromium) + Cheerio (HTML parsing) |
| Frontend | Single-file HTML/CSS/JS (vanilla, no framework) |
| Charts | Chart.js |
| Cache | File-based JSON (24h TTL) |
| Fonts | IBM Plex Mono + Instrument Serif (Google Fonts) |
| Design | Dark monochromatic industrial-editorial aesthetic, amber (#d4a843) accent |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Frontend)                     │
│  public/index.html — single-file SPA                     │
│  Fetches: /api/admissions/:id, /api/archives/:id         │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP
┌────────────────────────▼────────────────────────────────┐
│                  Express Server                          │
│  src/server.js — port 3000                               │
│                                                          │
│  Routes:                                                 │
│    GET /api/universities        → static list            │
│    GET /api/admissions/:id      → scrape pipeline        │
│    GET /api/admissions/:id/refresh → force re-scrape     │
│    GET /api/archives/:id        → raw JSON + citations   │
│    GET /api/health              → uptime + cache status  │
│    GET *                        → index.html             │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│              Scraper Dispatcher                          │
│  src/scrapers/index.js                                   │
│                                                          │
│  Priority chain (stops at first success):                │
│    1. Cache (file-based, 24h TTL)                        │
│    2. Official scrape (Playwright + Cheerio)              │
│    3. Affiliated scrape (Zenius/Quipper/SNPMB)           │
│    4. Fallback (curated JSON from data/hardcoded/)       │
│                                                          │
│  After retrieval:                                        │
│    → parser.js normalises into unified schema            │
│    → scorer.js calculates ease_score for each program    │
│    → scorer.js generates top-2 recommendations           │
└─────────────────────────────────────────────────────────┘
```

---

## Directory Map

```
J:\PROJECT ANALYST\uni-advisor\
├── src\
│   ├── server.js                 # Express API (all routes)
│   ├── scrapers\
│   │   ├── index.js              # Dispatcher: orchestrates scrape chain
│   │   ├── ugm.js                # UGM-specific scraper config
│   │   ├── ui.js                 # UI-specific scraper config
│   │   ├── itb.js                # ITB-specific scraper config
│   │   ├── its.js                # ITS-specific scraper config
│   │   └── unpad.js              # UNPAD-specific scraper config
│   ├── strategies\
│   │   ├── official.js           # Playwright + Cheerio helpers
│   │   ├── affiliated.js         # Third-party platform scrapers
│   │   └── fallback.js           # Loads curated JSON, passes sources
│   └── utils\
│       ├── parser.js             # Raw data → unified program schema
│       ├── scorer.js             # Ease Score formula + recommendations
│       └── cache.js              # File-based JSON cache (read/write/TTL)
├── public\
│   └── index.html                # Entire frontend (HTML + CSS + JS, ~1000 lines)
├── data\
│   ├── cache\                    # Auto-generated, gitignored
│   └── hardcoded\                # Curated fallback datasets
│       ├── ugm.json              # 36 programs, 4 citation sources
│       ├── ui.json               # 26 programs, 4 citation sources
│       ├── itb.json              # 26 programs, 3 citation sources
│       ├── its.json              # 25 programs, 3 citation sources
│       └── unpad.json            # 26 programs, 3 citation sources
├── .env                          # PORT, CACHE_TTL_HOURS (gitignored)
├── .gitignore
├── LICENSE                       # MIT
├── README.md
├── package.json
└── package-lock.json
```

---

## Data Schema

### Program Object (unified schema after parsing)

Every program in the system — whether scraped or loaded from JSON — is normalised to this shape:

```json
{
  "id": "ugm-teknik-sipil",
  "faculty": "Fakultas Teknik",
  "program": "Teknik Sipil",
  "level": "Sarjana",
  "quota_mandiri": 52,
  "applicants_mandiri": 1480,
  "acceptance_rate": 3.51,
  "min_score_2022": 672,
  "min_score_2023": 668,
  "min_score_2024": 665,
  "avg_min_score": 668,
  "score_trend": "decreasing",
  "source_type": "estimated",
  "source_ref": [0, 2],
  "ease_score": 8.6
}
```

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique ID: `{university}-{program-slug}` |
| `faculty` | string | Full faculty name in Bahasa Indonesia |
| `program` | string | Program name |
| `level` | string | Always `"Sarjana"` (this app only covers S1) |
| `quota_mandiri` | int | Number of seats available via Jalur Mandiri |
| `applicants_mandiri` | int | Number of applicants for Jalur Mandiri |
| `acceptance_rate` | float | `(quota / applicants) × 100` |
| `min_score_2022` | int | Minimum passing score estimate for 2022 |
| `min_score_2023` | int | Minimum passing score estimate for 2023 |
| `min_score_2024` | int | Minimum passing score estimate for 2024 |
| `avg_min_score` | int | Average of the 3 years |
| `score_trend` | string | `"decreasing"` / `"increasing"` / `"stable"` |
| `source_type` | string | `"official"` / `"affiliated"` / `"estimated"` |
| `source_ref` | int[] | Indices into the `sources[]` citation array |
| `ease_score` | float | Composite ranking metric (higher = easier to enter) |

### Source Citation Object

Each JSON file in `data/hardcoded/` has a top-level `sources` array:

```json
{
  "id": 0,
  "title": "Daya Tampung Jalur Mandiri UGM 2024",
  "publisher": "Kontan",
  "url": "https://www.kontan.co.id/",
  "type": "official-portal | news-report | education-platform",
  "accessed": "2024-06-15",
  "reliability": "high | medium | low",
  "notes": "Free-text context about what data was extracted from this source."
}
```

### API Response Shape (`/api/admissions/:id`)

```json
{
  "university": "ugm",
  "university_name": "Universitas Gadjah Mada",
  "programs": [ /* array of Program Objects */ ],
  "recommendations": [
    { "rank": 1, "program_id": "ugm-filsafat", "insight": "..." },
    { "rank": 2, "program_id": "ugm-ilmu-sejarah", "insight": "..." }
  ],
  "meta": {
    "total_programs": 36,
    "avg_acceptance_rate": 6.42,
    "lowest_min_score": 410,
    "highest_competition_ratio": 92.75
  },
  "source": "estimated:public-records",
  "data_confidence": "medium",
  "scraped_at": "2026-04-24T03:00:00.000Z"
}
```

### API Response Shape (`/api/archives/:id`)

```json
{
  "university": "ugm",
  "university_name": "Universitas Gadjah Mada",
  "sources": [ /* array of Source Citation Objects */ ],
  "programs": [ /* array of Program Objects with source_ref */ ],
  "total_programs": 36,
  "archive_date": "2026-04-24T03:00:00.000Z"
}
```

---

## Ease Score Formula

The core ranking metric. Higher = easier to get into at lower scores.

```
ease_score = (acceptance_rate × 0.6) + ((1 / avg_min_score) × 10000 × 0.4) + trend_bonus
```

| Component | Weight | Logic |
|---|---|---|
| Acceptance rate | 60% | Higher rate = easier admission |
| Inverse score | 40% | Lower min score = more accessible |
| Trend bonus | ±0.5 | Decreasing scores = +0.5 (getting easier), Increasing = -0.5 |

---

## Data Source Priority

When `/api/admissions/:id` is called, the dispatcher tries sources in this order:

```
1. CACHE        → data/cache/{id}.json (if exists and < 24h old)
2. OFFICIAL     → Playwright headless scrape of university portal
3. AFFILIATED   → Cheerio scrape of Zenius / Quipper / SNPMB
4. FALLBACK     → data/hardcoded/{id}.json (curated estimates, always succeeds)
```

The `source` field in the API response tells you which source was used:
- `"cache"` — served from cache
- `"official"` — live scraped from university portal
- `"affiliated:zenius"` — scraped from affiliated platform
- `"estimated:public-records"` — loaded from curated JSON fallback

The `data_confidence` field is set to:
- `"high"` — from official or government sources
- `"medium"` — from curated public records (current default for all fallback data)
- `"low"` — stale cache or uncertain source

---

## Frontend Overview

The frontend is a **single HTML file** (`public/index.html`, ~1000 lines) containing all CSS, HTML, and JavaScript inline. No build step, no framework.

### UI Sections (top to bottom)

1. **Header** — "Admission Advisor" title, selected university label
2. **University Selector** — 5-tab grid (UGM, UI, ITB, ITS, UNPAD)
3. **Source Bar** — Shows data source, confidence badge, timestamp, refresh button
4. **Recommended Programs** — Two cards showing top-2 easiest programs with stats
5. **Stat Strip** — 4-cell summary: total programs, avg acceptance %, lowest score, top competition
6. **Distribution Charts** — Bar chart of top acceptance rates + bar chart of lowest scores
7. **Score Trend Chart** — Line chart showing 3-year min score trends for top 5 programs
8. **All Programs Table** — Sortable table with all programs (click headers to sort)
9. **Data Archives** — Collapsible section with source citation cards + full archive table with per-program citation links
10. **Footer** — Disclaimer

### Design System

- **Dark theme**: `--bg: #080808`, text: `#f2ede6`
- **Accent**: amber `#d4a843` (used for active states, top recommendations, highlights)
- **Fonts**: IBM Plex Mono (data/UI), Instrument Serif (headings)
- **Layout**: Max-width 1360px, responsive grid with mobile breakpoints at 768px/900px
- **Animations**: CSS reveal animations with `animation-delay` staggering, count-up number animations

---

## Running the App

```bash
cd "J:\PROJECT ANALYST\uni-advisor"
npm start              # starts on port 3000
# or
node src/server.js     # same thing
```

The server auto-loads fallback data on first request if scraping fails. No external services required for basic operation.

---

## Known Constraints

1. **UI Kedokteran quota is 11** — This is the verified SIMAK UI 2024 figure. It's extremely low because UI allocates most medical seats through other pathways (PPKB, talent scouting). The `acceptance_rate` for this program is 0.16%.

2. **ITB uses faculty-group (kelompok) admission** — Per-prodi quotas in the ITB dataset are estimated subdivisions of faculty-level quotas, not official per-program numbers.

3. **All current data is "estimated" confidence** — The live scrapers exist but currently can't access official portals (login walls, CAPTCHA). All 5 universities are served from curated fallback data tagged as `source_type: "estimated"`.

4. **Cache files are gitignored** — `data/cache/` is ephemeral. Clearing it forces fresh fallback loads on next request.

5. **Port 3000** — Shared with other local services. The `bridge_connector.bat` script in the parent directory (`J:\PROJECT ANALYST\`) runs `taskkill /f /im node.exe` which kills this server. If the server dies unexpectedly, check if bridge_connector was run.

---

## GitHub

- **Repo**: https://github.com/RhaVans/admission-advisor
- **Branch**: `master`
- **License**: MIT
- **Visibility**: Public
