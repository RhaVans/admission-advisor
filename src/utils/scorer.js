'use strict';

/**
 * Admission Advisor v2 — Scoring Engine
 * Computes ease_score, volatility, crowding for programs.
 * Formula matches v2 spec exactly.
 */

// ── Volatility Index ────────────────────────────────────────────
function computeVolatility(scores) {
  const vals = [scores['2022'], scores['2023'], scores['2024']].filter(v => v && v > 0);
  if (vals.length < 2) return 0;
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  const variance = vals.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / vals.length;
  return parseFloat((Math.sqrt(variance) / mean).toFixed(4));
}

// ── Sharp Drop Detection ────────────────────────────────────────
function detectSharpDrop(scores) {
  const s23 = scores['2023'], s24 = scores['2024'];
  if (!s23 || !s24) return 0;
  const drop = (s23 - s24) / s23;
  return drop > 0.03 ? parseFloat(drop.toFixed(4)) : 0;
}

// ── Score Trend ─────────────────────────────────────────────────
function computeTrend(scores) {
  const s22 = scores['2022'], s24 = scores['2024'];
  if (!s22 || !s24) return 'stable';
  const d = s24 - s22;
  if (d > 5) return 'increasing';
  if (d < -5) return 'decreasing';
  return 'stable';
}

// ── Crowding Penalty ────────────────────────────────────────────
function computeCrowdingPenalty(volatility, sharpDrop) {
  return parseFloat(Math.min(volatility * 3.0 + sharpDrop * 5.0, 2.0).toFixed(4));
}

function crowdingRisk(penalty) {
  if (penalty >= 1.0) return 'high';
  if (penalty >= 0.3) return 'moderate';
  return 'low';
}

// ── Ease Score (v2 spec formula) ────────────────────────────────
function computeEaseScore(acceptanceRate, avgMinScore, trend, crowdingPenalty) {
  const ac = (acceptanceRate || 0) * 0.6;
  const sc = avgMinScore ? (1.0 / avgMinScore * 10000 * 0.4) : 0;
  const tb = { decreasing: 0.5, stable: 0, increasing: -0.5 }[trend] || 0;
  return parseFloat((ac + sc + tb - crowdingPenalty).toFixed(2));
}

// ── Score a single program ──────────────────────────────────────
function scoreProgram(program) {
  const scores = program.scores || {
    '2022': program.min_score_2022 || null,
    '2023': program.min_score_2023 || null,
    '2024': program.min_score_2024 || null,
  };

  // If pre-scored (from generate_data), use existing values
  if (program.ease_score && program.ease_score !== 0) {
    return {
      ...program,
      score_trend: computeTrend(scores),
      volatility_index: parseFloat((program.volatility_index || 0).toFixed(3)),
      ease_score: parseFloat((program.ease_score).toFixed(2)),
      crowding_penalty: parseFloat((program.crowding_penalty || 0).toFixed(4)),
    };
  }

  // Compute from scratch
  const volatility = computeVolatility(scores);
  const sharpDrop = detectSharpDrop(scores);
  const penalty = computeCrowdingPenalty(volatility, sharpDrop);
  const risk = crowdingRisk(penalty);
  const trend = computeTrend(scores);
  const ease = computeEaseScore(program.acceptance_rate, program.avg_min_score, trend, penalty);

  return {
    ...program,
    scores,
    score_trend: trend,
    volatility_index: parseFloat(volatility.toFixed(3)),
    sharp_drop_pct: parseFloat(sharpDrop.toFixed(4)),
    crowding_penalty: parseFloat(penalty.toFixed(4)),
    crowding_risk: risk,
    ease_score: parseFloat(ease.toFixed(2)),
  };
}

// ── Rank all programs ───────────────────────────────────────────
function rankPrograms(programs) {
  return programs
    .map(scoreProgram)
    .sort((a, b) => {
      if (b.ease_score !== a.ease_score) return b.ease_score - a.ease_score;
      return (a.volatility_index || 0) - (b.volatility_index || 0);
    });
}

// ── Generate insight (legacy compat — analyzer.js handles v2) ──
function generateInsight(program, allPrograms) {
  const avgRate = allPrograms.reduce((s, p) => s + (p.acceptance_rate || 0), 0) / (allPrograms.length || 1);
  const ratio = (program.acceptance_rate / avgRate).toFixed(1);
  const trend = program.score_trend || computeTrend(program.scores || {});
  let insight = `Acceptance rate ${program.acceptance_rate}% (${ratio}x avg). `;
  insight += trend === 'decreasing' ? 'Declining score threshold favors this cycle.' : trend === 'increasing' ? 'Rising scores indicate increasing demand.' : 'Stable competition pattern.';
  if (program.crowding_risk === 'moderate') insight += ' Moderate crowding risk — monitor closely.';
  if (program.crowding_risk === 'high') insight += ' HIGH crowding risk — consider alternatives.';
  return insight;
}

module.exports = {
  computeVolatility, detectSharpDrop, computeTrend,
  computeCrowdingPenalty, crowdingRisk, computeEaseScore,
  scoreProgram, rankPrograms, generateInsight,
};
