'use strict';
const path = require('path');
const fs = require('fs');
const { normalizePayload } = require('../utils/parser');
const { rankPrograms, generateInsight } = require('../utils/scorer');
const { analyzeUniversity } = require('../utils/analyzer');

// ── University Metadata ─────────────────────────────────────────
const UNIVERSITY_NAMES = {
  ugm: 'Universitas Gadjah Mada', ui: 'Universitas Indonesia',
  itb: 'Institut Teknologi Bandung', its: 'Institut Teknologi Sepuluh Nopember',
  unpad: 'Universitas Padjadjaran', ub: 'Universitas Brawijaya',
  upn_jogja: 'UPN Veteran Yogyakarta', undip: 'Universitas Diponegoro',
  upi: 'Universitas Pendidikan Indonesia', unair: 'Universitas Airlangga',
  unhas: 'Universitas Hasanuddin', usu: 'Universitas Sumatera Utara',
  poltekniknhi: 'Politeknik Pariwisata NHI Bandung', polmak: 'Politeknik Negeri Makassar',
};

// ── Hardcoded Fallback ──────────────────────────────────────────
const HARDCODED_DIR = path.join(__dirname, '../../data/hardcoded');

function loadHardcoded(universityId) {
  const file = path.join(HARDCODED_DIR, `${universityId}.json`);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

// ── Scraper loader (lazy) ───────────────────────────────────────
function loadScraper(universityId) {
  const scraperFile = path.join(__dirname, `${universityId}.js`);
  if (!fs.existsSync(scraperFile)) return null;
  try { return require(scraperFile); } catch { return null; }
}

// ── Main Scrape Pipeline ────────────────────────────────────────
async function scrape(universityId) {
  const uniName = UNIVERSITY_NAMES[universityId];
  if (!uniName) throw new Error(`Unknown university: ${universityId}`);

  let rawPrograms = null;
  let source = 'hardcoded';

  // 1. Try official scraper
  const scraper = loadScraper(universityId);
  if (scraper) {
    try {
      console.log(`[scraper] Trying official for ${universityId}...`);
      const official = await scraper.scrapeOfficial();
      if (official && official.length > 0) {
        rawPrograms = official;
        source = 'official';
        console.log(`[scraper] Official: ${official.length} programs`);
      }
    } catch (e) {
      console.warn(`[scraper] Official failed for ${universityId}: ${e.message}`);
    }

    // 2. Try affiliated
    if (!rawPrograms && scraper.scrapeAffiliated) {
      try {
        console.log(`[scraper] Trying affiliated for ${universityId}...`);
        const aff = await scraper.scrapeAffiliated();
        if (aff && aff.data && aff.data.length > 0) {
          rawPrograms = aff.data;
          source = `affiliated:${aff.platform}`;
          console.log(`[scraper] Affiliated (${aff.platform}): ${aff.data.length} programs`);
        }
      } catch (e) {
        console.warn(`[scraper] Affiliated failed for ${universityId}: ${e.message}`);
      }
    }
  }

  // 3. Hardcoded fallback (v2 JSON data)
  if (!rawPrograms) {
    const hc = loadHardcoded(universityId);
    if (hc && hc.programs && hc.programs.length > 0) {
      // v2 format: full university payload with programs, sources, metadata
      const normalized = normalizePayload(hc.programs, 'hardcoded');
      const scored = rankPrograms(normalized);

      // Build full payload for analyzer
      const payload = {
        university_id: universityId,
        university_name: hc.university_name || uniName,
        university_type: hc.university_type || 'S1',
        exam_name: hc.exam_name || '',
        score_range: hc.score_range || '0-1000',
        year: hc.year || '2024',
        programs: scored,
        sources: hc.sources || [],
      };

      // Run analyzer to produce v2 output
      const analysis = analyzeUniversity(payload);

      // Legacy compat: add top-level fields expected by v1 frontend
      const recommendations = (analysis.recommendations || []).slice(0, 2).map((rec, i) => ({
        rank: i + 1,
        program_id: rec.program_id,
        insight: rec.insight ? rec.insight.headline : generateInsight(scored.find(p => p.name === rec.program_id) || scored[0], scored),
      }));

      return {
        university_id: universityId,
        university_name: hc.university_name || uniName,
        university_type: hc.university_type || 'S1',
        exam_name: hc.exam_name || '',
        score_range: hc.score_range || '0-1000',
        source: 'hardcoded',
        data_confidence: 'medium',
        scraped_at: new Date().toISOString(),
        programs: scored,
        recommendations,
        meta: analysis.meta,
        // v2 analysis data
        analysis,
      };
    }
    throw new Error(`No data available for ${universityId}`);
  }

  // Process scraped data through v2 pipeline
  const normalized = normalizePayload(rawPrograms, source.startsWith('official') ? 'official' : 'affiliated');
  const scored = rankPrograms(normalized);

  const hcFull = loadHardcoded(universityId) || {};
  const payload = {
    university_id: universityId,
    university_name: hcFull.university_name || uniName,
    university_type: hcFull.university_type || 'S1',
    exam_name: hcFull.exam_name || '',
    score_range: hcFull.score_range || '0-1000',
    year: hcFull.year || '2024',
    programs: scored,
    sources: hcFull.sources || [],
  };

  const analysis = analyzeUniversity(payload);
  const recommendations = (analysis.recommendations || []).slice(0, 2).map((rec, i) => ({
    rank: i + 1,
    program_id: rec.program_id,
    insight: rec.insight ? rec.insight.headline : generateInsight(scored.find(p => p.name === rec.program_id) || scored[0], scored),
  }));

  return {
    university_id: universityId,
    university_name: uniName,
    university_type: hcFull.university_type || 'S1',
    exam_name: hcFull.exam_name || '',
    score_range: hcFull.score_range || '0-1000',
    source,
    data_confidence: source === 'official' ? 'high' : source.startsWith('affiliated') ? 'medium' : 'medium',
    scraped_at: new Date().toISOString(),
    programs: scored,
    recommendations,
    meta: analysis.meta,
    analysis,
  };
}

module.exports = { scrape, UNIVERSITY_NAMES };
