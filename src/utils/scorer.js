'use strict';

/**
 * Computes the ease score for a program.
 * Higher = easier to get accepted with a lower score.
 *
 * Formula:
 *   acceptanceComponent = acceptance_rate * 0.6
 *   scoreComponent      = (1 / avg_min_score) * 10000 * 0.4
 *   trendBonus          = -0.5 | 0 | +0.5
 */
function computeEaseScore(program) {
  const acceptanceComponent = (program.acceptance_rate || 0) * 0.6;
  const scoreComponent = program.avg_min_score
    ? (1 / program.avg_min_score) * 10000 * 0.4
    : 0;
  const trendBonus = { decreasing: 0.5, stable: 0, increasing: -0.5 }[program.score_trend] ?? 0;
  return parseFloat((acceptanceComponent + scoreComponent + trendBonus).toFixed(4));
}

/**
 * Generates a 2-sentence insight string explaining the recommendation.
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

  return `${sentence1} ${sentence2}`;
}

/**
 * Scores all programs in-place and returns the top 2 as recommendations.
 */
function rankPrograms(programs) {
  // Compute ease scores
  programs.forEach(p => { p.ease_score = computeEaseScore(p); });

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

  return {
    total_programs:           sarjana.length,
    avg_acceptance_rate:      parseFloat((rates.reduce((a, b) => a + b, 0) / (rates.length || 1)).toFixed(2)),
    lowest_min_score:         scores.length ? Math.min(...scores) : 0,
    highest_competition_ratio: ratios.length ? `1:${Math.max(...ratios)}` : 'N/A',
    scrape_duration_ms:       durationMs || 0,
  };
}

module.exports = { computeEaseScore, generateInsight, rankPrograms, buildMeta };
