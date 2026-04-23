# Admission Advisor

> Analytical platform for Indonesian university Jalur Mandiri admissions. Identifies Sarjana (S1) programs with highest acceptance probability at minimum passing scores across 5 top national universities.

Built with an autonomous scraping pipeline that attempts official portals first, falls back to affiliated platforms, and defaults to curated public estimates. All data is transparent — every figure traces back to its source.

---

## Features

- **Real-time scraping** — Playwright + Cheerio pipeline targeting official university admissions portals
- **Multi-source fallback** — Official → Affiliated (Zenius/Quipper/SNPMB) → Curated public estimates
- **Ease Score ranking** — Composite metric favouring programs with highest acceptance probability at lowest passing score
- **Data Archives** — Full dataset transparency with per-program source citations and verified quota figures
- **Score trend analysis** — 3-year minimum score trends (2022–2024) with directional indicators

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

## API

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/universities` | List supported universities |
| `GET` | `/api/admissions/:id` | Admissions data with recommendations (cache → scrape → fallback) |
| `GET` | `/api/admissions/:id/refresh` | Force fresh scrape, bypass cache |
| `GET` | `/api/archives/:id` | Raw dataset with full source citations |
| `GET` | `/api/health` | Server health and cache status |

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
│   │   ├── scorer.js       # Ease Score formula + insight generator
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
ease_score = (acceptance_rate × 0.6) + ((1 / avg_min_score) × 10000 × 0.4) + trend_bonus
```

| Trend | Bonus | Meaning |
|---|---|---|
| Decreasing | `+0.5` | Getting easier over time |
| Stable | `0` | No significant change |
| Increasing | `-0.5` | Getting harder |

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
