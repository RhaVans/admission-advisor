'use strict';

/**
 * Admission Advisor v2 — Data Parser & Normalizer
 * Normalizes raw program data from any source into the v2 schema.
 */

/**
 * Normalizes a single program from any source to the v2 internal schema.
 * Handles both v1 (old field names) and v2 (new field names).
 */
function normalizeProgram(raw, source_type = 'hardcoded') {
  // Handle both v1 and v2 field names
  const name = raw.name || raw.program || '';
  const faculty = raw.faculty || '';
  const capacity = raw.capacity || raw.quota_mandiri || 30;
  const applicants = raw.applicants || raw.applicants_mandiri || capacity * 10;
  const acceptance_rate = raw.acceptance_rate || (applicants > 0 ? parseFloat((capacity / applicants * 100).toFixed(2)) : 0);

  // Score handling — v2 uses `scores` object, v1 uses flat fields
  const scores = raw.scores || {
    '2022': raw.min_score_2022 || null,
    '2023': raw.min_score_2023 || null,
    '2024': raw.min_score_2024 || null,
  };
  const avg_min_score = raw.avg_min_score || computeAvgScore(scores);

  return {
    // Core identity
    id: (raw.id || name.toLowerCase().replace(/\s+/g, '-')),
    name,
    program: name, // alias for backward compat
    faculty,
    program_type: raw.program_type || 'S1',

    // Quantitative
    capacity,
    applicants,
    quota_mandiri: capacity, // backward compat alias
    applicants_mandiri: applicants, // backward compat alias
    acceptance_rate,
    avg_min_score,
    scores,
    min_score_2022: scores['2022'],
    min_score_2023: scores['2023'],
    min_score_2024: scores['2024'],

    // Rapor & UTBK
    avg_rapor: raw.avg_rapor || null,
    avg_utbk: raw.avg_utbk || null,
    rapor_source_tier: raw.rapor_source_tier || null,
    utbk_source_tier: raw.utbk_source_tier || null,

    // v2 structured data (pass through)
    admission_pathways: raw.admission_pathways || [],
    career_prospects: raw.career_prospects || { static: [], ai_generated: null, avg_starting_salary_idr: null, job_market_demand: null, source_tier: 'third-party' },
    competition_breakdown: raw.competition_breakdown || { local_applicants_pct: null, out_of_province_pct: null, top_feeder_schools: null, avg_applicant_utbk: null, source_tier: 'third-party' },

    // Scoring (will be computed by scorer.js)
    ease_score: raw.ease_score || 0,
    volatility_index: raw.volatility_index || 0,
    sharp_drop_pct: raw.sharp_drop_pct || 0,
    crowding_penalty: raw.crowding_penalty || 0,
    crowding_risk: raw.crowding_risk || 'low',

    // Source tracking
    source_type: raw.source_type || source_type,
    source_ref: raw.source_ref || [],
    data_confidence: raw.data_confidence || 'medium',
  };
}

function computeAvgScore(scores) {
  const vals = [scores['2022'], scores['2023'], scores['2024']].filter(v => v && v > 0);
  if (vals.length === 0) return 0;
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

/**
 * Normalizes an entire university payload (array of programs).
 */
function normalizePayload(rawPrograms, source_type = 'hardcoded') {
  return rawPrograms.map(p => normalizeProgram(p, source_type));
}

module.exports = { normalizeProgram, normalizePayload, computeAvgScore };
