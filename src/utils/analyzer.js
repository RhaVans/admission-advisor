'use strict';

/**
 * Admission Advisor v2 — Deterministic Analysis Engine
 * Produces the full v2 output contract from scored program data.
 * No AI calls — all prose generated via rules and heuristics.
 */

// ── Currency formatter ──────────────────────────────────────────
function formatIDR(amount) {
  if (!amount && amount !== 0) return null;
  return 'Rp ' + amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// ── Competition intensity from ratio ────────────────────────────
function intensityFromRatio(ratio) {
  if (ratio <= 3.0) return 'very_low';
  if (ratio <= 6.0) return 'low';
  if (ratio <= 10.0) return 'moderate';
  if (ratio <= 15.0) return 'high';
  return 'very_high';
}

// ── Score trend from history ────────────────────────────────────
function scoreTrend(scores) {
  const s22 = scores['2022'], s24 = scores['2024'];
  if (!s22 || !s24) return 'insufficient_data';
  const d = s24 - s22;
  if (d > 5) return 'increasing';
  if (d < -5) return 'decreasing';
  return 'stable';
}

// ── UTBK cluster guess from faculty name ────────────────────────
function utbkCluster(faculty) {
  const f = (faculty || '').toLowerCase();
  if (/teknik|mipa|sains|kedokteran|farmasi|keperawatan|kesehatan|biologi|fisika|kimia|informatika|komputer/.test(f)) return 'Saintek';
  if (/hukum|ekonom|bisnis|sosial|politik|komunikasi|budaya|psikologi|sastra|sejarah|filsafat|pendidikan|administrasi|seni/.test(f)) return 'Soshum';
  return 'Mixed (Saintek/Soshum)';
}

// ── Program English name mapping ────────────────────────────────
const NAME_MAP = {
  'Pendidikan Dokter': 'Medicine', 'Pendidikan Dokter Gigi': 'Dentistry',
  'Ilmu Hukum': 'Law', 'Manajemen': 'Management', 'Akuntansi': 'Accounting',
  'Ilmu Ekonomi': 'Economics', 'Psikologi': 'Psychology',
  'Ilmu Komunikasi': 'Communication Studies', 'Hubungan Internasional': 'International Relations',
  'Teknik Sipil': 'Civil Engineering', 'Teknik Mesin': 'Mechanical Engineering',
  'Teknik Elektro': 'Electrical Engineering', 'Teknik Kimia': 'Chemical Engineering',
  'Teknik Industri': 'Industrial Engineering', 'Teknik Informatika': 'Informatics',
  'Informatika': 'Informatics', 'Ilmu Komputer': 'Computer Science',
  'Sistem Informasi': 'Information Systems', 'Teknik Geologi': 'Geological Engineering',
  'Teknik Geodesi': 'Geodetic Engineering', 'Arsitektur': 'Architecture',
  'Fisika': 'Physics', 'Kimia': 'Chemistry', 'Matematika': 'Mathematics',
  'Statistika': 'Statistics', 'Biologi': 'Biology', 'Farmasi': 'Pharmacy',
  'Ilmu Keperawatan': 'Nursing', 'Ilmu Gizi': 'Nutrition Science',
  'Sosiologi': 'Sociology', 'Agronomi': 'Agronomy', 'Agroteknologi': 'Agrotechnology',
  'Peternakan': 'Animal Science', 'Kehutanan': 'Forestry', 'Perikanan': 'Fisheries',
  'Sastra Indonesia': 'Indonesian Literature', 'Arkeologi': 'Archaeology',
  'Ilmu Sejarah': 'History', 'Ilmu Filsafat': 'Philosophy',
  'Teknik Pertambangan': 'Mining Engineering', 'Teknik Perminyakan': 'Petroleum Engineering',
  'Teknik Metalurgi': 'Metallurgical Engineering', 'Teknik Lingkungan': 'Environmental Engineering',
  'Teknik Perkapalan': 'Naval Architecture', 'Teknik Kelautan': 'Ocean Engineering',
  'Sains Data': 'Data Science', 'Teknologi Informasi': 'Information Technology',
  'Desain Produk': 'Product Design', 'Administrasi Publik': 'Public Administration',
  'Administrasi Bisnis': 'Business Administration', 'Kesehatan Masyarakat': 'Public Health',
  'Ilmu Kelautan': 'Marine Science', 'Kedokteran Hewan': 'Veterinary Medicine',
  'Administrasi Hotel': 'Hotel Administration', 'Manajemen Tata Boga': 'Culinary Management',
  'Manajemen Kepariwisataan': 'Tourism Management', 'Seni Kuliner': 'Culinary Arts',
};

function englishName(indonesian) {
  return NAME_MAP[indonesian] || indonesian;
}

// ── Sector derivation from roles ────────────────────────────────
function deriveSectors(roles) {
  const sectors = new Set();
  const map = {
    'Technology': /engineer|developer|data|ml|it |software|informatik|programmer|web|network/i,
    'Healthcare': /doctor|nurse|pharmacist|dentist|veterinar|health|medical|clinical/i,
    'Finance': /accountant|auditor|tax|financial|banking|actuary|economist/i,
    'Public Sector': /government|policy|public|diplomat|judge|administrator/i,
    'Education': /teacher|instructor|educator|professor|lecturer/i,
    'Consulting': /consultant|analyst|advisor/i,
    'Construction': /construction|architect|civil|surveyor|planner/i,
    'Energy': /petroleum|mining|power|energy|geolog/i,
    'Hospitality': /hotel|chef|tourism|travel|culinary|restaurant|event|f&b|hospitality/i,
    'Agriculture': /agri|farm|forest|fish|livestock|aquaculture|plantation/i,
    'Media': /journalist|pr |public relation|content|editor|marketer|media/i,
    'Research': /research|scientist|lab/i,
  };
  (roles || []).forEach(r => {
    Object.entries(map).forEach(([sector, rx]) => { if (rx.test(r)) sectors.add(sector); });
  });
  return [...sectors].slice(0, 4);
}

// ── Salary range estimate ───────────────────────────────────────
function salaryRange(avg) {
  if (!avg) return null;
  const lo = Math.round(avg * 0.75 / 100000) * 100000;
  const hi = Math.round(avg * 1.4 / 100000) * 100000;
  return `${formatIDR(lo)} - ${formatIDR(hi)} / month`;
}

// ── Demand rationale generator ──────────────────────────────────
function demandRationale(demand, roles, faculty) {
  const cluster = utbkCluster(faculty);
  if (demand === 'high') {
    if (cluster === 'Saintek') return 'Strong demand driven by Indonesia\'s infrastructure expansion and digital transformation. BPS data indicates persistent shortage in STEM graduates relative to industry needs.';
    return 'High demand sector in Indonesia\'s growing service economy. Increasing formalization of professional services drives consistent graduate absorption.';
  }
  if (demand === 'medium') return 'Moderate demand with stable employment prospects. Graduates typically find positions within 6 months, though starting salaries vary significantly by employer tier.';
  return 'Niche field with limited but specialized demand. Career paths exist but may require geographic flexibility or postgraduate specialization.';
}

// ── Growth outlook generator ────────────────────────────────────
function growthOutlook(roles, faculty) {
  const f = (faculty || '').toLowerCase();
  if (/informatika|komputer|data|informasi/.test(f)) return 'Indonesia\'s digital economy is projected to reach $146B by 2025. Government push for digital talent through Kampus Merdeka and startup ecosystem growth create strong 5-year demand trajectory.';
  if (/kedokteran|keperawatan|kesehatan|farmasi|gizi/.test(f)) return 'Healthcare sector expansion under JKN (universal healthcare) and post-pandemic investment in health infrastructure create sustained demand for health professionals across Indonesia.';
  if (/teknik|sipil|mesin|elektro|industri/.test(f)) return 'Indonesia\'s hilirisasi (downstream industrialization) policy and Nusantara capital city project drive strong engineering demand through 2030.';
  if (/ekonom|bisnis|manajemen|akuntansi/.test(f)) return 'Financial sector digitalization and MSME formalization create growing demand for business and finance professionals, particularly those with digital competencies.';
  if (/hukum/.test(f)) return 'Regulatory complexity from Omnibus Law implementation and growing corporate compliance needs sustain legal profession demand in Indonesia.';
  if (/pertanian|peternakan|kehutanan|perikanan|agri|pangan/.test(f)) return 'Indonesia\'s food sovereignty agenda and agricultural modernization programs create emerging opportunities, though the sector remains structurally lower-paying.';
  if (/pariwisata|hotel|kuliner|hospitali/.test(f)) return 'Indonesia targets 8.5M foreign tourists by 2025. Super-priority destination development (Bali, Labuan Bajo, Borobudur, Mandalika, Likupang) drives hospitality sector growth.';
  if (/tambang|perminyakan|mineral|geologi|geofisika/.test(f)) return 'Hilirisasi mandate (nickel export ban, downstream processing) creates strong demand for mining and resource engineering professionals through 2030.';
  if (/pendidikan/.test(f)) return 'Indonesia\'s Guru Penggerak program and PPG (teacher certification) reform create structured pathways, though salary growth remains tied to civil service scales.';
  return 'Moderate growth outlook aligned with Indonesia\'s economic development trajectory. Sector-specific opportunities depend on government policy direction and private sector investment patterns.';
}

// ── Build competition profile ───────────────────────────────────
function buildCompetitionProfile(program) {
  const ratio = program.applicants && program.capacity ? parseFloat((program.applicants / program.capacity).toFixed(1)) : 0;
  const bd = program.competition_breakdown || {};
  const intensity = intensityFromRatio(ratio);

  let summary = `Competition ratio of ${ratio}:1 indicates ${intensity.replace('_', ' ')} competition pressure.`;
  if (bd.local_applicants_pct) summary += ` Approximately ${bd.local_applicants_pct}% of applicants are from the local/home province.`;

  return {
    summary,
    avg_competitor_utbk: bd.avg_applicant_utbk || null,
    local_dominance: bd.local_applicants_pct ? `${bd.local_applicants_pct}% local applicants` : null,
    top_feeder_schools: bd.top_feeder_schools || [],
    competition_intensity: intensity,
    intensity_rationale: `With a competition ratio of ${ratio}:1 and ${program.crowding_risk || 'low'} crowding risk, this program falls in the ${intensity.replace('_', ' ')} intensity category.`,
  };
}

// ── Build rapor/UTBK profile ────────────────────────────────────
function buildRaporUtbkProfile(program) {
  const caveats = [];
  if (program.rapor_source_tier === 'third-party' || program.rapor_source_tier === 'third-party-affiliated')
    caveats.push('Rapor data sourced from tier 3-4 estimates');
  if (program.utbk_source_tier === 'third-party' || program.utbk_source_tier === 'third-party-affiliated')
    caveats.push('UTBK data sourced from tier 3-4 estimates');
  if (!program.avg_rapor && !program.avg_utbk)
    caveats.push('No rapor or UTBK average data available for this program');

  const cluster = utbkCluster(program.faculty);
  return {
    avg_rapor_accepted: program.avg_rapor || null,
    avg_utbk_accepted: program.avg_utbk || null,
    rapor_note: program.avg_rapor ? 'Rapor average is primarily relevant for SNBP pathway. For Mandiri, rapor may be used as supplementary data depending on university policy.' : null,
    utbk_note: program.avg_utbk ? `UTBK ${cluster} cluster scores most relevant for this program.` : null,
    data_caveat: caveats.length ? caveats.join('. ') : null,
  };
}

// ── Build admission pathways output ─────────────────────────────
function buildAdmissionPathways(pathways) {
  return (pathways || []).map(pw => {
    const uktRange = (pw.ukt_min && pw.ukt_max)
      ? `${formatIDR(pw.ukt_min)} - ${formatIDR(pw.ukt_max)} / semester`
      : null;
    const reqSummary = (pw.requirements || []).length
      ? pw.requirements.slice(0, 3).join(', ') + '.'
      : 'Requirements not publicly listed.';
    return {
      name: pw.name,
      type: pw.type,
      capacity: pw.capacity || null,
      registration_fee_idr: pw.registration_fee,
      ukt_range: uktRange,
      requirements_summary: reqSummary,
      open_period: pw.open_period || null,
      portal_url: pw.portal_url || null,
      notes: pw.ukt_note || null,
    };
  });
}

// ── Build career prospects output ───────────────────────────────
function buildCareerProspects(program) {
  const cp = program.career_prospects || {};
  const roles = (cp.static || []).slice(0, 6);
  const sectors = deriveSectors(roles);
  return {
    top_roles: roles,
    sectors,
    avg_starting_salary_idr: cp.avg_starting_salary_idr || null,
    salary_range: salaryRange(cp.avg_starting_salary_idr),
    job_market_demand: cp.job_market_demand || null,
    demand_rationale: demandRationale(cp.job_market_demand, roles, program.faculty),
    growth_outlook: growthOutlook(roles, program.faculty),
    data_caveat: cp.source_tier === 'third-party' ? 'Career data sourced from third-party estimates and may not reflect current market conditions.' : null,
  };
}

// ── Build insight block ─────────────────────────────────────────
function buildInsight(program, allPrograms) {
  const avgRate = allPrograms.reduce((s, p) => s + (p.acceptance_rate || 0), 0) / (allPrograms.length || 1);
  const ratio = (program.acceptance_rate / avgRate).toFixed(1);
  const trend = scoreTrend(program.scores || {});
  const hardest = [...allPrograms].sort((a, b) => (a.acceptance_rate || 0) - (b.acceptance_rate || 0))[0];
  const scoreDiff = hardest && program.avg_min_score && hardest.avg_min_score
    ? program.avg_min_score - hardest.avg_min_score : 0;

  const trendDesc = {
    decreasing: 'declining over 3 years, suggesting easing competition',
    increasing: 'rising over 3 years, indicating growing demand',
    stable: 'stable over 3 years, suggesting predictable competition',
    insufficient_data: 'not trackable due to insufficient historical data',
  }[trend];

  return {
    headline: `${program.acceptance_rate}% acceptance, ${ratio}x university avg — ${trend === 'decreasing' ? 'easing' : trend === 'increasing' ? 'tightening' : 'stable'} trend`,
    acceptance_context: `Acceptance rate of ${program.acceptance_rate}% is ${ratio}x the university average of ${avgRate.toFixed(1)}%. ${program.acceptance_rate > avgRate ? 'Above-average accessibility.' : 'Below-average accessibility — competitive program.'}`,
    score_context: `Average minimum score of ${program.avg_min_score || 'N/A'} is ${scoreDiff < 0 ? Math.abs(scoreDiff) + ' points below' : scoreDiff + ' points above'} the hardest program (${hardest ? hardest.name : 'N/A'}).`,
    rapor_utbk_context: (program.avg_rapor || program.avg_utbk) ? `Accepted students average ${program.avg_rapor ? 'rapor ' + program.avg_rapor : ''}${program.avg_rapor && program.avg_utbk ? ' and ' : ''}${program.avg_utbk ? 'UTBK ' + program.avg_utbk : ''}. Use these as benchmark targets.` : null,
    risk_assessment: `Crowding risk is ${program.crowding_risk || 'low'} with volatility index ${(program.volatility_index || 0).toFixed(3)}. ${program.crowding_risk === 'moderate' ? 'Monitor applicant trends — some instability detected.' : program.crowding_risk === 'high' ? 'Elevated crowding risk — proceed with caution.' : 'Stable and predictable competition pattern.'}`,
    trend_signal: `Score threshold has been ${trendDesc}. ${trend === 'decreasing' ? 'This is favorable for applicants targeting lower score entry points.' : trend === 'increasing' ? 'Expect higher score requirements this cycle.' : 'Consistent scoring expectations.'}`,
    strategic_note: program.crowding_risk === 'high'
      ? 'Consider this as a backup choice only — high crowding risk means unpredictable outcomes.'
      : program.acceptance_rate > 10
        ? 'Strong strategic pick — favorable acceptance rate with manageable competition.'
        : 'Viable option — prepare thoroughly for the mandiri exam to maximize chances.',
  };
}

// ── Build comparative summary ───────────────────────────────────
function buildComparativeSummary(r1, r2, p1, p2) {
  if (!r1 || !r2 || !p1 || !p2) return null;
  const rateDiff = Math.abs(p1.acceptance_rate - p2.acceptance_rate).toFixed(1);
  const scoreDiff = Math.abs((p1.avg_min_score || 0) - (p2.avg_min_score || 0));
  const safer = p1.ease_score > p2.ease_score ? 'rank_1' : p1.ease_score < p2.ease_score ? 'rank_2' : 'tied';

  // Cost comparison
  let costComp = null;
  const pw1 = (p1.admission_pathways || []).find(p => p.type === 'Mandiri');
  const pw2 = (p2.admission_pathways || []).find(p => p.type === 'Mandiri');
  if (pw1 && pw2 && pw1.registration_fee && pw2.registration_fee) {
    costComp = `Registration fees: ${formatIDR(pw1.registration_fee)} vs ${formatIDR(pw2.registration_fee)}. UKT ranges are similar as both programs are at the same university.`;
  }

  // Career comparison
  const cp1 = p1.career_prospects || {}, cp2 = p2.career_prospects || {};
  const sal1 = cp1.avg_starting_salary_idr, sal2 = cp2.avg_starting_salary_idr;
  let careerComp = `${englishName(p1.name)} leads to careers in ${deriveSectors(cp1.static || []).join(', ') || 'various sectors'}, while ${englishName(p2.name)} targets ${deriveSectors(cp2.static || []).join(', ') || 'various sectors'}.`;
  if (sal1 && sal2) careerComp += ` Starting salary difference: ${formatIDR(Math.abs(sal1 - sal2))} favoring ${sal1 > sal2 ? 'Rank 1' : 'Rank 2'}.`;

  return {
    vs_each_other: `${englishName(p1.name)} offers ${rateDiff}% higher acceptance rate but requires a score ${scoreDiff} points ${(p1.avg_min_score || 0) > (p2.avg_min_score || 0) ? 'higher' : 'lower'} than ${englishName(p2.name)}. Both carry ${p1.crowding_risk || 'low'} crowding risk.`,
    key_tradeoff: `Acceptance probability vs score requirement — ${englishName(p1.name)} is more accessible while ${englishName(p2.name)} ${(p2.avg_min_score || 0) < (p1.avg_min_score || 0) ? 'has a lower score threshold' : 'offers different faculty diversity'}.`,
    safer_pick: safer,
    safer_pick_reason: safer === 'rank_1' ? `Higher ease score (${p1.ease_score} vs ${p2.ease_score}) with more favorable acceptance dynamics.` : safer === 'rank_2' ? `Higher ease score (${p2.ease_score} vs ${p1.ease_score}).` : 'Both programs have equivalent ease scores.',
    career_comparison: careerComp,
    cost_comparison: costComp,
  };
}

// ══════════════════════════════════════════════════════════════════
// MAIN ANALYZER
// ══════════════════════════════════════════════════════════════════
function analyzeUniversity(payload) {
  const programs = payload.programs || [];
  const sources = payload.sources || [];

  // Separate by type
  const s1Programs = programs.filter(p => p.program_type !== 'D4');
  const d4Programs = programs.filter(p => p.program_type === 'D4');
  const hasS1 = s1Programs.length > 0;
  const hasD4 = d4Programs.length > 0;
  const uniType = hasS1 && hasD4 ? 'mixed' : hasD4 ? 'D4' : 'S1';

  function processType(progs) {
    // Step 1 — Eligibility filter
    let eligible = progs.filter(p => {
      if (p.crowding_risk === 'high') return false;
      if (p.data_confidence === 'low' && (p.capacity || 0) < 30) return false;
      if ((p.applicants || 0) < 50) return false;
      return true;
    });

    let selectionNotes = null;
    if (eligible.length === 0) {
      selectionNotes = 'All programs carry elevated crowding risk or insufficient data. Showing top 2 by ease_score with caveats.';
      eligible = [...progs];
    }

    // Step 2 — Rank by ease_score
    const sorted = [...eligible].sort((a, b) => {
      if (b.ease_score !== a.ease_score) return b.ease_score - a.ease_score;
      return (a.volatility_index || 0) - (b.volatility_index || 0); // tiebreaker
    });

    let pick1 = sorted[0] || null;
    let pick2 = sorted[1] || null;

    // Step 3 — Diversity check
    if (pick1 && pick2 && pick1.faculty === pick2.faculty && sorted[2]) {
      const threshold = pick2.ease_score * 0.85;
      if (sorted[2].ease_score >= threshold) {
        selectionNotes = `Rank 2 substituted: ${pick2.name} replaced by ${sorted[2].name} for faculty diversity (both original picks from ${pick1.faculty}).`;
        pick2 = sorted[2];
      }
    }

    const buildRec = (prog, rank) => {
      if (!prog) return null;
      const ratio = prog.applicants && prog.capacity ? parseFloat((prog.applicants / prog.capacity).toFixed(1)) : 0;
      return {
        rank,
        program: englishName(prog.name),
        program_id: prog.name,
        program_type: prog.program_type || 'S1',
        faculty: prog.faculty,
        metrics: {
          capacity: prog.capacity,
          applicants: prog.applicants,
          acceptance_rate_pct: parseFloat((prog.acceptance_rate || 0).toFixed(1)),
          competition_ratio: ratio,
          ease_score: parseFloat((prog.ease_score || 0).toFixed(2)),
          avg_min_score: prog.avg_min_score || null,
          avg_rapor: prog.avg_rapor ? parseFloat(prog.avg_rapor.toFixed(1)) : null,
          avg_rapor_tier: prog.rapor_source_tier || null,
          avg_utbk: prog.avg_utbk ? parseFloat(prog.avg_utbk.toFixed(1)) : null,
          avg_utbk_tier: prog.utbk_source_tier || null,
          volatility_index: parseFloat((prog.volatility_index || 0).toFixed(3)),
          crowding_risk: prog.crowding_risk || 'low',
          score_trend: scoreTrend(prog.scores || {}),
          score_history: prog.scores || { '2022': null, '2023': null, '2024': null },
        },
        competition_profile: buildCompetitionProfile(prog),
        rapor_utbk_profile: buildRaporUtbkProfile(prog),
        admission_pathways: buildAdmissionPathways(prog.admission_pathways),
        career_prospects: buildCareerProspects(prog),
        insight: buildInsight(prog, progs),
        data_quality: {
          confidence: prog.data_confidence || 'medium',
          source_ids: prog.source_ref || [],
          caveat: prog.data_confidence !== 'high' ? 'Data sourced from curated public estimates, not official university records. Cross-reference with official portals before applying.' : null,
        },
      };
    };

    const r1 = buildRec(pick1, 1);
    const r2 = buildRec(pick2, 2);
    const recs = [r1, r2].filter(Boolean);
    const comp = (r1 && r2) ? buildComparativeSummary(r1, r2, pick1, pick2) : null;

    return { recommendations: recs, comparative_summary: comp, selection_notes: selectionNotes };
  }

  // Process each type
  const result = {
    university: payload.university_name || payload.university_id,
    university_type: uniType,
    year: payload.year || '2024',
    exam_name: payload.exam_name || '',
    score_range: payload.score_range || '0-1000',
    analysis_timestamp: new Date().toISOString(),
    selection_notes: null,
    recommendations: [],
    comparative_summary: null,
    disclaimer: 'Recommendations are based on historical data and algorithmic scoring. Admission outcomes are probabilistic. Rapor and UTBK averages reflect accepted students from prior cycles and may not represent current cycle requirements. Always verify with official university portals before applying.',
  };

  if (hasS1) {
    const s1 = processType(s1Programs);
    result.recommendations = result.recommendations.concat(s1.recommendations);
    result.comparative_summary = s1.comparative_summary;
    result.selection_notes = s1.selection_notes;
  }

  if (hasD4) {
    const d4 = processType(d4Programs);
    if (hasS1) {
      // Separate D4 recommendations with adjusted ranks
      const d4Recs = d4.recommendations.map((r, i) => ({ ...r, rank: i + 1, _type: 'D4' }));
      result.d4_recommendations = d4Recs;
      result.d4_comparative_summary = d4.comparative_summary;
      if (d4.selection_notes) result.selection_notes = (result.selection_notes || '') + ' [D4] ' + d4.selection_notes;
    } else {
      result.recommendations = d4.recommendations;
      result.comparative_summary = d4.comparative_summary;
      result.selection_notes = d4.selection_notes;
    }
  }

  // Attach all programs with computed fields for frontend table
  result.programs = programs;
  result.sources = sources;
  result.meta = buildMeta(programs);

  return result;
}

function buildMeta(programs) {
  const rates = programs.map(p => p.acceptance_rate || 0);
  const scores = programs.map(p => p.avg_min_score).filter(Boolean);
  const ratios = programs.map(p => p.applicants && p.capacity ? Math.round(p.applicants / p.capacity) : 0);
  const maxCrowding = programs.reduce((max, p) => (p.crowding_penalty || 0) > (max.crowding_penalty || 0) ? p : max, programs[0] || {});

  return {
    total_programs: programs.length,
    avg_acceptance_rate: parseFloat((rates.reduce((a, b) => a + b, 0) / (rates.length || 1)).toFixed(2)),
    lowest_min_score: scores.length ? Math.min(...scores) : 0,
    highest_competition_ratio: ratios.length ? `1:${Math.max(...ratios)}` : 'N/A',
    highest_crowding_risk: maxCrowding.name || 'N/A',
    highest_crowding_penalty: parseFloat((maxCrowding.crowding_penalty || 0).toFixed(2)),
  };
}

module.exports = { analyzeUniversity, formatIDR, englishName };
