'use strict';
const { normalizePrograms } = require('../utils/parser');
const { rankPrograms, buildMeta } = require('../utils/scorer');
const { loadFallback } = require('../strategies/fallback');

const scrapers = {
  ugm:   require('./ugm'),
  ui:    require('./ui'),
  itb:   require('./itb'),
  its:   require('./its'),
  unpad: require('./unpad'),
};

const UNIVERSITY_NAMES = {
  ugm:   'Universitas Gadjah Mada',
  ui:    'Universitas Indonesia',
  itb:   'Institut Teknologi Bandung',
  its:   'Institut Teknologi Sepuluh Nopember',
  unpad: 'Universitas Padjadjaran',
};

/**
 * Main dispatcher. Runs: official → affiliated → fallback.
 * Always returns a fully-formed response object.
 *
 * @param {string} universityId
 * @returns {Promise<object>}
 */
async function scrape(universityId) {
  const scraper = scrapers[universityId];
  if (!scraper) throw new Error(`Unknown university: ${universityId}`);

  const start = Date.now();
  let rawPrograms = [];
  let source = 'fallback:hardcoded';
  let dataConfidence = 'low';

  // ── 1. Official scrape ────────────────────────────────────────────────────
  try {
    console.log(`[scraper] Attempting official scrape for ${universityId}…`);
    const officialRaw = await scraper.scrapeOfficial();
    if (officialRaw && officialRaw.length >= 5) {
      rawPrograms = officialRaw;
      source = 'official';
      dataConfidence = 'high';
      console.log(`[scraper] Official success: ${rawPrograms.length} programs`);
    }
  } catch (err) {
    console.warn(`[scraper] Official scrape error for ${universityId}:`, err.message);
  }

  // ── 2. Affiliated scrape ─────────────────────────────────────────────────
  if (rawPrograms.length < 5) {
    try {
      console.log(`[scraper] Attempting affiliated scrape for ${universityId}…`);
      const result = await scraper.scrapeAffiliated();
      const affiliatedData = Array.isArray(result) ? result : (result?.data || []);
      const platform = result?.platform || 'unknown';
      if (affiliatedData.length >= 5) {
        rawPrograms = affiliatedData;
        source = `affiliated:${platform}`;
        dataConfidence = 'medium';
        console.log(`[scraper] Affiliated success (${platform}): ${rawPrograms.length} programs`);
      }
    } catch (err) {
      console.warn(`[scraper] Affiliated scrape error for ${universityId}:`, err.message);
    }
  }

  // ── 3. Curated fallback (public historical estimates) ───────────────────────
  if (rawPrograms.length < 5) {
    console.log(`[scraper] Using curated estimates for ${universityId}`);
    const fb = loadFallback(universityId);
    if (fb && fb.programs.length > 0) {
      rawPrograms = fb.programs;
      source = 'estimated:public-records';
      dataConfidence = 'medium';
    } else {
      throw new Error(`All data sources failed for ${universityId}`);
    }
  }

  // ── Normalize & score ─────────────────────────────────────────────────────
  const normalized = normalizePrograms(rawPrograms, universityId);
  const { programs, recommendations } = rankPrograms(normalized);
  const durationMs = Date.now() - start;
  const meta = buildMeta(programs, durationMs);

  return {
    university:      universityId,
    university_name: UNIVERSITY_NAMES[universityId] || universityId.toUpperCase(),
    scraped_at:      new Date().toISOString(),
    source,
    data_confidence: dataConfidence,
    programs,
    recommendations,
    meta,
  };
}

module.exports = { scrape, UNIVERSITY_NAMES };

// CLI: node src/scrapers/index.js --all
if (require.main === module) {
  const args = process.argv.slice(2);
  const ids = args.includes('--all') ? Object.keys(scrapers) : args;
  (async () => {
    for (const id of ids) {
      try {
        console.log(`\n=== Scraping ${id.toUpperCase()} ===`);
        const data = await scrape(id);
        console.log(`Done: ${data.programs.length} programs, source: ${data.source}`);
      } catch (err) {
        console.error(`Failed for ${id}:`, err.message);
      }
    }
  })();
}
