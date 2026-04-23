'use strict';

/**
 * Determines score trend from three year values.
 * @param {number} s22
 * @param {number} s23
 * @param {number} s24
 * @returns {'increasing'|'stable'|'decreasing'}
 */
function computeTrend(s22, s23, s24) {
  const delta = s24 - s22;
  if (delta > 5) return 'increasing';
  if (delta < -5) return 'decreasing';
  return 'stable';
}

/**
 * Normalises a raw scraped/hardcoded program entry to the unified schema.
 * Missing fields get sensible defaults.
 */
function normalizeProgram(raw, universityId) {
  const s22 = Number(raw.min_score_2022) || 0;
  const s23 = Number(raw.min_score_2023) || s22;
  const s24 = Number(raw.min_score_2024) || s23;
  const quota = Number(raw.quota_mandiri) || 1;
  const apps  = Number(raw.applicants_mandiri) || quota;
  const rate  = Number(raw.acceptance_rate) || parseFloat(((quota / apps) * 100).toFixed(2));
  const avg   = Number(raw.avg_min_score)   || Math.round((s22 + s23 + s24) / 3);
  const trend = raw.score_trend || computeTrend(s22, s23, s24);

  // Build a slug if none provided
  const id = raw.id || `${universityId}-${(raw.program || 'unknown').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;

  return {
    id,
    faculty:              raw.faculty || 'Unknown Faculty',
    program:              raw.program || 'Unknown Program',
    level:                raw.level   || 'Sarjana',
    quota_mandiri:        quota,
    applicants_mandiri:   apps,
    acceptance_rate:      parseFloat(rate.toFixed(2)),
    min_score_2022:       s22,
    min_score_2023:       s23,
    min_score_2024:       s24,
    avg_min_score:        avg,
    score_trend:          trend,
    source_type:          raw.source_type || 'estimated',
    ease_score:           0, // computed by scorer
  };
}

/**
 * Normalises an array of raw programs.
 */
function normalizePrograms(rawArray, universityId) {
  return (rawArray || []).map(r => normalizeProgram(r, universityId));
}

module.exports = { normalizeProgram, normalizePrograms, computeTrend };
