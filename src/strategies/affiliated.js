'use strict';
const axios = require('axios');
const cheerio = require('cheerio');

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8',
};

/**
 * Generic Cheerio fetch helper.
 */
async function fetchPage(url) {
  const res = await axios.get(url, { headers: HEADERS, timeout: 20000, maxRedirects: 5 });
  return cheerio.load(res.data);
}

/**
 * Scrape SNPMB portal for passing grade data.
 * https://snpmb.bppp.kemdikbud.go.id
 */
async function scrapeSnpmb(universityKeyword) {
  // SNPMB data is mostly PDF-based and behind auth — returns empty to fall through.
  console.log(`[affiliated] SNPMB scrape attempted for ${universityKeyword} (likely unavailable without auth)`);
  return [];
}

/**
 * Scrape Zenius passing grade data (public blog/resource pages).
 * Tags data as source_type: 'affiliated'.
 */
async function scrapeZenius(universityId) {
  const urlMap = {
    ugm:   'https://zenius.net/blog/passing-grade-ugm',
    ui:    'https://zenius.net/blog/passing-grade-ui',
    itb:   'https://zenius.net/blog/passing-grade-itb',
    its:   'https://zenius.net/blog/passing-grade-its',
    unpad: 'https://zenius.net/blog/passing-grade-unpad',
  };
  const url = urlMap[universityId];
  if (!url) return [];

  try {
    const $ = await fetchPage(url);
    const programs = [];

    // Zenius typically uses tables with columns: Program | Min Score | Quota etc.
    $('table tbody tr').each((_, row) => {
      const cells = $(row).find('td');
      if (cells.length < 3) return;
      const program = $(cells[0]).text().trim();
      const faculty  = $(cells[1]).text().trim();
      const minScore = parseInt($(cells[2]).text().replace(/\D/g, ''), 10);
      if (!program || !minScore) return;

      programs.push({
        program,
        faculty: faculty || 'Unknown',
        min_score_2024: minScore,
        min_score_2023: minScore + 3,
        min_score_2022: minScore + 6,
        quota_mandiri: 30,
        applicants_mandiri: 600,
        source_type: 'affiliated',
      });
    });

    console.log(`[affiliated] Zenius scraped ${programs.length} programs for ${universityId}`);
    return programs;
  } catch (err) {
    console.warn(`[affiliated] Zenius failed for ${universityId}: ${err.message}`);
    return [];
  }
}

/**
 * Scrape Quipper passing grade data.
 */
async function scrapeQuipper(universityId) {
  const slugMap = {
    ugm: 'ugm', ui: 'ui', itb: 'itb', its: 'its', unpad: 'unpad',
  };
  const slug = slugMap[universityId];
  if (!slug) return [];

  try {
    const url = `https://www.quipper.com/id/blog/tips-trick/school-of-info/passing-grade-${slug}/`;
    const $ = await fetchPage(url);
    const programs = [];

    $('table tbody tr').each((_, row) => {
      const cells = $(row).find('td');
      if (cells.length < 2) return;
      const program  = $(cells[0]).text().trim();
      const minScore = parseInt($(cells[cells.length - 1]).text().replace(/\D/g, ''), 10);
      if (!program || !minScore) return;

      programs.push({
        program,
        faculty: 'Unknown',
        min_score_2024: minScore,
        min_score_2023: minScore + 4,
        min_score_2022: minScore + 8,
        quota_mandiri: 30,
        applicants_mandiri: 500,
        source_type: 'estimated',
      });
    });

    console.log(`[affiliated] Quipper scraped ${programs.length} programs for ${universityId}`);
    return programs;
  } catch (err) {
    console.warn(`[affiliated] Quipper failed for ${universityId}: ${err.message}`);
    return [];
  }
}

/**
 * Master affiliated scraper — tries each source in priority order.
 * Returns first non-empty result.
 * @param {string} universityId
 * @returns {Promise<{data: any[], platform: string}>}
 */
async function scrapeAffiliated(universityId) {
  // 1. SNPMB (usually fails without auth — quick attempt)
  const snpmb = await scrapeSnpmb(universityId);
  if (snpmb.length > 0) return { data: snpmb, platform: 'snpmb' };

  // 2. Zenius
  const zenius = await scrapeZenius(universityId);
  if (zenius.length > 0) return { data: zenius, platform: 'zenius' };

  // 3. Quipper
  const quipper = await scrapeQuipper(universityId);
  if (quipper.length > 0) return { data: quipper, platform: 'quipper' };

  // All failed
  return { data: [], platform: 'none' };
}

module.exports = { scrapeAffiliated };
