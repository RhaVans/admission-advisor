# Admission Advisor

> Analytical platform for Indonesian university Jalur Mandiri admissions. Identifies Sarjana (S1) programs with highest acceptance probability at minimum passing scores across 5 top national universities.

**Live:** [uni-advisor-kappa.vercel.app](https://uni-advisor-kappa.vercel.app)

Built with an autonomous scraping pipeline that attempts official portals first, falls back to affiliated platforms, and defaults to curated public estimates. All data is transparent — every figure traces back to its source.

---

## Features

- **Real-time scraping** — Playwright + Cheerio pipeline targeting official university admissions portals
- **Multi-source fallback** — Official → Affiliated (Zenius/Quipper/SNPMB) → Curated public estimates
- **Ease Score ranking** — Composite metric favouring programs with highest acceptance probability at lowest passing score
- **Volatility Index** — Measures historical instability (coefficient of variation) of a program's minimum passing score across 3 years
- **Crowding Penalty** — Penalises programs with sharp score drops that attract applicant surges the following cycle (mean-reversion trap detection)
- **Data Archives** — Full dataset transparency with per-program source citations and verified quota figures
- **Score trend analysis** — 3-year minimum score trends (2022–2024) with directional indicators
- **Mobile responsive** — Optimised for phones (390px+), tablets, and desktop viewports

## Supported Universities

| ID | University | Mandiri Portal |
|---|---|---|
| `ugm` | Universitas Gadjah Mada | UM-UGM |
| `ui` | Universitas Indonesia | SIMAK UI |
| `itb` | Institut Teknologi Bandung | USM ITB |
| `its` | Institut Teknologi Sepuluh Nopember | SM ITS |
| `unpad` | Universitas Padjadjaran | SMUP Unpad |

---

## Quick Start

```bash
# Install dependencies
npm install

# Install Playwright Chromium (required for JS-rendered pages)
npx playwright install chromium

# Start the server
npm start
```

Open **http://localhost:3000**

---

## Deployment

Hosted on Vercel with automatic deploys from `master`:

```bash
npx vercel --prod
```

---

## API

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/universities` | List supported universities |
| `GET` | `/api/admissions/:id` | Admissions data with recommendations (cache → scrape → fallback) |
| `GET` | `/api/admissions/:id/refresh` | Force fresh scrape, bypass cache |
| `GET` | `/api/archives/:id` | Raw dataset with full source citations |
| `GET` | `/api/health` | Server health and cache status |

### Response Fields (Admissions)

Each program object includes:

| Field | Description |
|---|---|
| `ease_score` | Composite ranking metric (higher = easier to enter) |
| `volatility_index` | Coefficient of variation of 3-year min scores (σ/μ) |
| `sharp_drop_pct` | Year-over-year score drop percentage (0 if ≤3%) |
| `crowding_penalty` | `(volatility × 3.0) + (sharpDrop × 5.0)`, capped at 2.0 |
| `crowding_risk` | `low` / `moderate` / `high` based on penalty thresholds |

---

## Project Structure

```
uni-advisor/
├── src/
│   ├── scrapers/           # Per-university scraper modules
│   │   ├── index.js        # Scraper dispatcher (official → affiliated → fallback)
│   │   ├── ugm.js
│   │   ├── ui.js
│   │   ├── itb.js
│   │   ├── its.js
│   │   └── unpad.js
│   ├── strategies/
│   │   ├── official.js     # Playwright + Cheerio scraping
│   │   ├── affiliated.js   # Third-party platform scrapers
│   │   └── fallback.js     # Curated JSON loader with source passthrough
│   ├── utils/
│   │   ├── parser.js       # Raw → unified schema normaliser
│   │   ├── scorer.js       # Ease Score + Volatility Index + Crowding Penalty
│   │   └── cache.js        # File-based JSON cache (24h TTL)
│   └── server.js           # Express API
├── public/
│   └── index.html          # Single-file frontend (HTML + CSS + JS)
├── data/
│   ├── cache/              # Auto-generated per-university cache
│   └── hardcoded/          # Curated fallback datasets with source citations
│       ├── ugm.json        # 36 programs, 4 sources
│       ├── ui.json         # 26 programs, 4 sources
│       ├── itb.json        # 26 programs, 3 sources
│       ├── its.json        # 25 programs, 3 sources
│       └── unpad.json      # 26 programs, 3 sources
├── directives/
│   └── system_context.md   # Full operational context for agents
├── vercel.json             # Vercel deployment config
├── .env
├── package.json
└── README.md
```

---

## Data Sources & Transparency

Each program entry in the dataset includes `source_ref` indices pointing to verified citation objects. The Data Archives section in the UI makes these fully browsable.

**Source types:**

| Type | Reliability | Description |
|---|---|---|
| `official-portal` | High | Direct from university admissions portal |
| `news-report` | Medium–High | Published by Kontan, Tempo, Detik, Sindonews, etc. |
| `education-platform` | Medium | Aggregated by UTBK-CAK, Brain Academy, Zenius, etc. |

**Citation schema:**

```json
{
  "id": 0,
  "title": "Daya Tampung Jalur Mandiri UGM 2024",
  "publisher": "Kontan",
  "url": "https://...",
  "type": "news-report",
  "accessed": "2024-06-15",
  "reliability": "high",
  "notes": "Per-prodi breakdown: Teknik Sipil 52, Hukum 128, Kedokteran 69."
}
```

---

## Ease Score Formula

Programs are ranked by a composite Ease Score:

```
ease_score = (acceptance_rate × 0.6) + ((1 / avg_min_score) × 10000 × 0.4) + trend_bonus − crowding_penalty
```

| Component | Weight | Logic |
|---|---|---|
| Acceptance rate | 60% | Higher rate = easier admission |
| Inverse score | 40% | Lower min score = more accessible |
| Trend bonus | ±0.5 | Decreasing = +0.5, Increasing = -0.5 |
| Crowding penalty | 0–2.0 | Penalises volatile programs with sharp drops |

### Crowding Penalty

```
crowding_penalty = min((volatility_index × 3.0) + (sharp_drop × 5.0), 2.0)
```

| Risk Level | Penalty Range | Meaning |
|---|---|---|
| Low | < 0.3 | Stable, safe to recommend |
| Moderate | 0.3 – 1.0 | Some volatility, monitor closely |
| High | ≥ 1.0 | Likely applicant surge, avoid recommending |

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | HTTP server port |
| `PLAYWRIGHT_HEADLESS` | `true` | Run Chromium headlessly |
| `CACHE_TTL_HOURS` | `24` | Cache validity (hours) |
| `NODE_ENV` | `development` | Environment mode |

---

## Adding a University

1. Create `src/scrapers/<id>.js` exporting `officialUrls`, `affiliatedUrls`, `scrapeOfficial()`, `scrapeAffiliated()`
2. Register in `src/scrapers/index.js`
3. Add to `UNIVERSITIES` array in `src/server.js`
4. Create `data/hardcoded/<id>.json` with programs and `sources` citation array
5. Add affiliated URLs in `src/strategies/affiliated.js`

---

## License

MIT

---

## Disclaimer

Data sourced from official university admissions portals and affiliated educational platforms. Historical minimum passing scores are estimates derived from publicly available records. This tool is for **informational and educational purposes only** and is not affiliated with any university or government body.
