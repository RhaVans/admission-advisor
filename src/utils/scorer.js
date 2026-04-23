'use strict';

// ── Volatility & Crowding ────────────────────────────────

/**
 * Measures historical instability of a program's min score.
 * Returns coefficient of variation (stdDev / mean).
 */
function computeVolatilityIndex(program) {
  const scores = [program.min_score_2022, program.min_score_2023, program.min_score_2024]
    .filter(s => s > 0);
  if (scores.length < 2) return 0;
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
  const stdDev = Math.sqrt(variance);
  return stdDev / mean;
}

/**
 * Detects if the most recent year had an abnormally large score drop.
 * Returns the drop percentage if > 3%, otherwise 0.
 */
function detectSharpDrop(program) {
  const prev = program.min_score_2023;
  const curr = program.min_score_2024;
  if (!prev || !curr) return 0;
  const dropPct = (prev - curr) / prev;
  return dropPct > 0.03 ? dropPct : 0;
}

/**
 * Computes a crowding penalty combining volatility and sharp drop signals.
 * Capped at 2.0 to avoid over-penalizing.
 */
function computeCrowdingPenalty(program) {
  const volatility = computeVolatilityIndex(program);
  const sharpDrop = detectSharpDrop(program);
  const penalty = (volatility * 3.0) + (sharpDrop * 5.0);
  return Math.min(penalty, 2.0);
}

/**
 * Returns the crowding risk label based on penalty magnitude.
 */
function crowdingRiskLevel(penalty) {
  if (penalty >= 1.0) return 'high';
  if (penalty >= 0.3) return 'moderate';
  return 'low';
}

// ── Core Scoring ─────────────────────────────────────────

/**
 * Computes the ease score for a program.
 * Higher = easier to get accepted with a lower score.
 *
 * Formula:
 *   acceptanceComponent = acceptance_rate * 0.6
 *   scoreComponent      = (1 / avg_min_score) * 10000 * 0.4
 *   trendBonus          = -0.5 | 0 | +0.5
 *   crowdingPenalty      = f(volatility, sharpDrop), capped at 2.0
 */
function computeEaseScore(program) {
  const acceptanceComponent = (program.acceptance_rate || 0) * 0.6;
  const scoreComponent = program.avg_min_score
    ? (1 / program.avg_min_score) * 10000 * 0.4
    : 0;
  const trendBonus = { decreasing: 0.5, stable: 0, increasing: -0.5 }[program.score_trend] ?? 0;
  const crowdingPenalty = computeCrowdingPenalty(program);
  return parseFloat((acceptanceComponent + scoreComponent + trendBonus - crowdingPenalty).toFixed(4));
}

/**
 * Generates a 2-3 sentence insight string explaining the recommendation.
 * Appends a crowding warning if risk is moderate or high.
 */
function generateInsight(program, rank, allPrograms) {
  const avgRate = allPrograms.reduce((s, p) => s + p.acceptance_rate, 0) / allPrograms.length;
  const rateRatio = (program.acceptance_rate / avgRate).toFixed(1);
  const trendDesc = {
    decreasing: 'trended downward over the past 3 years, indicating reduced competition pressure',
    stable:     'remained stable over the past 3 years, suggesting predictable competition',
    increasing: 'trended upward over the past 3 years, suggesting rising demand — act early',
  }[program.score_trend] || 'shown mixed movement';

  const sentence1 = `${program.program} has an acceptance rate of ${program.acceptance_rate}%, which is ${rateRatio}× the university average of ${avgRate.toFixed(1)}%.`;
  const sentence2 = `Its minimum passing score has ${trendDesc}, with the most recent threshold at ${program.min_score_2024} points.`;

  let base = `${sentence1} ${sentence2}`;

  // Append crowding warning if applicable
  const risk = program.crowding_risk;
  if (risk === 'moderate' || risk === 'high') {
    const dropPct = (program.sharp_drop_pct * 100).toFixed(1);
    base += ` However, its recent score drop of ${dropPct}% signals potential crowding this cycle — monitor applicant trends closely.`;
  }

  return base;
}

/**
 * Scores all programs in-place and returns the top 2 as recommendations.
 * Attaches volatility, sharp drop, crowding penalty, and risk fields.
 */
function rankPrograms(programs) {
  // Compute volatility + crowding fields, then ease score
  programs.forEach(p => {
    p.volatility_index = parseFloat(computeVolatilityIndex(p).toFixed(4));
    p.sharp_drop_pct = parseFloat(detectSharpDrop(p).toFixed(4));
    p.crowding_penalty = parseFloat(computeCrowdingPenalty(p).toFixed(4));
    p.crowding_risk = crowdingRiskLevel(p.crowding_penalty);
    p.ease_score = computeEaseScore(p);
  });

  // Sort by ease score descending
  const sorted = [...programs].sort((a, b) => b.ease_score - a.ease_score);

  // Build top-2 recommendations
  const recommendations = sorted.slice(0, 2).map((prog, i) => ({
    rank: i + 1,
    program_id: prog.id,
    insight: generateInsight(prog, i + 1, programs),
  }));

  return { programs, recommendations };
}

/**
 * Builds the meta summary object from a list of scored programs.
 */
function buildMeta(programs, durationMs) {
  const sarjana = programs.filter(p => p.level === 'Sarjana' || !p.level);
  const rates = sarjana.map(p => p.acceptance_rate);
  const scores = sarjana.map(p => p.avg_min_score).filter(Boolean);
  const ratios = sarjana.map(p =>
    p.applicants_mandiri && p.quota_mandiri
      ? Math.round(p.applicants_mandiri / p.quota_mandiri)
      : 0
  );

  // Find program with highest crowding penalty
  const maxCrowding = sarjana.reduce((max, p) =>
    (p.crowding_penalty || 0) > (max.crowding_penalty || 0) ? p : max
  , sarjana[0] || {});

  return {
    total_programs:           sarjana.length,
    avg_acceptance_rate:      parseFloat((rates.reduce((a, b) => a + b, 0) / (rates.length || 1)).toFixed(2)),
    lowest_min_score:         scores.length ? Math.min(...scores) : 0,
    highest_competition_ratio: ratios.length ? `1:${Math.max(...ratios)}` : 'N/A',
    highest_crowding_risk:    maxCrowding.program || 'N/A',
    highest_crowding_penalty: parseFloat((maxCrowding.crowding_penalty || 0).toFixed(2)),
    scrape_duration_ms:       durationMs || 0,
  };
}

module.exports = { computeEaseScore, computeVolatilityIndex, detectSharpDrop, computeCrowdingPenalty, crowdingRiskLevel, generateInsight, rankPrograms, buildMeta };
