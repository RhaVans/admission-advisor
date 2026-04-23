'use strict';
const fs   = require('fs');
const path = require('path');

const HARDCODED_DIR = path.join(__dirname, '../../data/hardcoded');

/**
 * Loads curated fallback data for a university.
 * Data is researched from publicly available historical estimates.
 * @param {string} universityId
 * @returns {{ programs: any[], confidence: 'medium' } | null}
 */
function loadFallback(universityId) {
  const file = path.join(HARDCODED_DIR, `${universityId}.json`);
  if (!fs.existsSync(file)) return null;
  try {
    const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
    // Tag all entries as estimated from public records
    const programs = (raw.programs || []).map(p => ({
      ...p,
      source_type: 'estimated',
    }));
    const sources = raw.sources || [];
    return { programs, sources, confidence: 'medium' };
  } catch (err) {
    console.error(`[fallback] Failed to load ${universityId}.json:`, err.message);
    return null;
  }
}

module.exports = { loadFallback };
