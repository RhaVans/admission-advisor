// ══════════════════════════════════════════════════════════════════
// Admission Advisor v2 — Frontend Application
// ══════════════════════════════════════════════════════════════════

const S = {
  uni: null, data: null, loading: false,
  sortCol: 'ease_score', sortDir: 'desc',
  charts: {},
  archives: null, archivesOpen: false
};

const API = '/api';

// ── Helpers ──────────────────────────────────────────────────────
const trendText = t => t === 'decreasing' ? 'Decreasing' : t === 'increasing' ? 'Increasing' : 'Stable';
const trendClass = t => t === 'decreasing' ? 'trend-down' : t === 'increasing' ? 'trend-up' : 'trend-flat';
const trendArrow = t => t === 'decreasing' ? '\u2193' : t === 'increasing' ? '\u2191' : '\u2192';
const srcDot = t => t === 'official' ? 'source-pip--official' : (t === 'affiliated' || t === 'estimated') ? 'source-pip--affiliated' : 'source-pip--hardcoded';
const srcLabel = s => {
  if (s === 'official') return 'Official Portal';
  if (s === 'cache') return 'Cached Data';
  if (s && s.startsWith('affiliated')) return s.replace('affiliated:', '').toUpperCase();
  if (s && s.startsWith('estimated')) return 'Public Records Estimate';
  return 'Curated Data';
};
const confLevel = c => c === 'high' ? 'high' : c === 'medium' ? 'medium' : 'low';
const crowdColor = r => r === 'high' ? 'var(--red)' : r === 'moderate' ? 'var(--yellow)' : 'var(--green)';
const crowdLabel = r => r === 'high' ? 'High' : r === 'moderate' ? 'Moderate' : 'Low';
const formatIDR = v => v ? 'Rp ' + v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '—';

function animateNum(el, end, dur) {
  const isInt = Number.isInteger(end);
  let start = null;
  const step = ts => {
    if (!start) start = ts;
    const p = Math.min((ts - start) / dur, 1);
    const v = p * end;
    el.textContent = isInt ? Math.floor(v) : v.toFixed(2);
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function runCountUp() {
  document.querySelectorAll('.count-up').forEach(el => {
    const v = parseFloat(el.dataset.v);
    if (isNaN(v)) return;
    animateNum(el, v, 700);
  });
}

// ── Fetchers ─────────────────────────────────────────────────────
async function fetchUnis() {
  try { const r = await fetch(`${API}/universities`); return await r.json(); }
  catch { showBanner('Failed to load university list.', true); return []; }
}

async function fetchData(id, refresh = false) {
  S.loading = true;
  showSkeleton();
  hideBanner();
  try {
    const url = `${API}/admissions/${id}${refresh ? '/refresh' : ''}`;
    const r = await fetch(url);
    const d = await r.json();
    if (d.error) throw new Error(d.message);
    S.data = d;
    S.sortCol = 'ease_score';
    S.sortDir = 'desc';
    render();
    fetchArchives(id);
  } catch (e) {
    showBanner(e.message, true);
    document.getElementById('dashboard').classList.add('hidden');
  } finally {
    S.loading = false;
    const btn = document.getElementById('refresh-btn');
    btn.disabled = false;
    btn.textContent = 'Refresh';
  }
}

// ── UI Helpers ───────────────────────────────────────────────────
function showSkeleton() {
  const dash = document.getElementById('dashboard');
  dash.classList.remove('hidden');
  document.getElementById('rec-container').innerHTML =
    `<div style="border:1px solid var(--border);padding:2rem">${'<div class="skel skel--line"></div>'.repeat(3)}<div class="skel skel--big"></div></div>`.repeat(2);
  document.getElementById('stat-strip').innerHTML =
    Array(5).fill('<div class="stat-cell"><div class="skel skel--big"></div><div class="skel skel--line" style="width:60%"></div></div>').join('');
  document.getElementById('table-body').innerHTML =
    Array(5).fill(`<tr>${Array(12).fill('<td><div class="skel skel--line"></div></td>').join('')}</tr>`).join('');
}

function showBanner(msg, isErr = false) {
  const b = document.getElementById('error-banner');
  b.classList.remove('hidden', 'banner--warn', 'banner--err');
  b.classList.add(isErr ? 'banner--err' : 'banner--warn');
  document.getElementById('error-message').textContent = msg;
}
function hideBanner() { document.getElementById('error-banner').classList.add('hidden'); }

// ── Selector Renderer ────────────────────────────────────────────
function renderSelector(unis) {
  const s1 = unis.filter(u => u.type !== 'D4');
  const d4 = unis.filter(u => u.type === 'D4');
  const container = document.getElementById('university-selector');

  const renderGroup = (title, items, badgeClass) => {
    const cards = items.map(u =>
      `<button class="selector__item" data-id="${u.id}" onclick="pick('${u.id}')">
        <span class="selector__id">${u.id.replace('_', ' ')}</span>
        <span class="selector__name">${u.name}</span>
        ${badgeClass ? `<span class="type-badge ${badgeClass}">${u.type}</span>` : ''}
      </button>`
    ).join('');
    return `<div class="selector__group">
      <div class="selector__group-title">${title}</div>
      <div class="selector__grid">${cards}</div>
    </div>`;
  };

  container.innerHTML = renderGroup('Universitas (S1)', s1, '') + renderGroup('Politeknik (D4)', d4, 'type-badge--d4');
}

function pick(id) {
  if (S.loading) return;
  S.uni = id;
  document.querySelectorAll('.selector__item').forEach(el =>
    el.classList.toggle('is-active', el.dataset.id === id)
  );
  fetchData(id);
}

// ── Main Render ──────────────────────────────────────────────────
function render() {
  const d = S.data;
  const dash = document.getElementById('dashboard');
  dash.classList.remove('hidden');

  // Header status
  const hs = document.getElementById('header-status');
  hs.classList.remove('hidden');
  document.getElementById('header-uni-label').textContent = d.university_name;
  document.getElementById('header-time').textContent = new Date(d.scraped_at).toLocaleString();

  renderSource();
  renderUniInfo();
  renderRecs();
  renderComparativeSummary();
  renderStats();
  renderCharts();
  renderTable();
  renderArchivesReset();
}

// ── Source Bar ────────────────────────────────────────────────────
function renderSource() {
  const { source, data_confidence, scraped_at } = S.data;
  const cl = confLevel(data_confidence);
  const dot = document.getElementById('source-dot');
  dot.className = `source-dot source-dot--${cl}`;
  document.getElementById('source-name').textContent = srcLabel(source);
  const tag = document.getElementById('confidence-tag');
  tag.className = `confidence-tag confidence-tag--${cl}`;
  tag.textContent = cl.toUpperCase();
  document.getElementById('scraped-time').textContent = new Date(scraped_at).toLocaleString();
}

// ── University Info Bar ──────────────────────────────────────────
function renderUniInfo() {
  const d = S.data;
  const el = document.getElementById('uni-info');
  if (!d.exam_name && !d.university_type) { el.classList.add('hidden'); return; }
  el.classList.remove('hidden');
  el.innerHTML = [
    ['Type', d.university_type || 'S1'],
    ['Mandiri Exam', d.exam_name || '—'],
    ['Score Range', d.score_range || '0-1000'],
    ['Year', d.analysis?.year || '2024'],
    ['Total Programs', d.programs?.length || 0],
  ].map(([l,v]) => `<div class="uni-info__item"><div class="uni-info__label">${l}</div><div class="uni-info__val">${v}</div></div>`).join('');
}

// ── Recommendation Cards ─────────────────────────────────────────
function renderRecs() {
  const { programs, analysis } = S.data;
  const recs = analysis ? analysis.recommendations : [];
  const c = document.getElementById('rec-container');

  c.innerHTML = recs.map((rec, i) => {
    const p = programs.find(x => x.name === rec.program_id || x.id === rec.program_id);
    if (!rec) return '';
    const m = rec.metrics || {};
    const cp = rec.competition_profile || {};
    const ru = rec.rapor_utbk_profile || {};
    const pw = rec.admission_pathways || [];
    const ca = rec.career_prospects || {};
    const ins = rec.insight || {};
    const dq = rec.data_quality || {};
    const pwId = `pw-${i}`;

    return `
      <div class="rec-card reveal" style="animation-delay:${i * 0.15}s">
        <div class="rec-card__rank">${rec.rank}</div>
        <div class="rec-card__program">${rec.program}</div>
        <div class="rec-card__faculty">${rec.faculty} &middot; ${rec.program_type}</div>
        <div class="rec-card__rate">
          <span class="count-up" data-v="${m.acceptance_rate_pct || 0}">${m.acceptance_rate_pct || 0}</span><span class="rec-card__rate-unit">%</span>
        </div>
        <div class="rec-card__rate-label">Acceptance Rate &middot; Jalur Mandiri</div>

        <!-- Core metrics grid -->
        <div class="rec-card__row">
          <div class="rec-card__metric">
            <div class="rec-card__metric-val">${m.avg_min_score || '—'}</div>
            <div class="rec-card__metric-label">Avg Min Score</div>
          </div>
          <div class="rec-card__metric">
            <div class="rec-card__metric-val ${trendClass(m.score_trend)}">${trendArrow(m.score_trend)} ${trendText(m.score_trend)}</div>
            <div class="rec-card__metric-label">Score Trend</div>
          </div>
          <div class="rec-card__metric">
            <div class="rec-card__metric-val">${(m.ease_score || 0).toFixed(1)}</div>
            <div class="rec-card__metric-label">Ease Score</div>
          </div>
          <div class="rec-card__metric">
            <div class="rec-card__metric-val" style="color:${crowdColor(m.crowding_risk)}">
              <span class="crowding-dot crowding-dot--${m.crowding_risk || 'low'}"></span>${crowdLabel(m.crowding_risk)}
            </div>
            <div class="rec-card__metric-label">Crowding Risk</div>
          </div>
        </div>

        <!-- Competition Profile -->
        <div class="comp-profile">
          <div class="comp-profile__title">Competition Profile</div>
          <span class="intensity-badge intensity-badge--${cp.competition_intensity || 'low'}">${(cp.competition_intensity || 'low').replace('_',' ').toUpperCase()}</span>
          <div class="comp-profile__row"><span>Ratio</span><span>${m.competition_ratio || '—'}:1</span></div>
          ${cp.avg_competitor_utbk ? `<div class="comp-profile__row"><span>Avg Competitor UTBK</span><span>${cp.avg_competitor_utbk}</span></div>` : ''}
          ${cp.local_dominance ? `<div class="comp-profile__row"><span>Local Dominance</span><span>${cp.local_dominance}</span></div>` : ''}
          <div style="font-size:0.6rem;color:var(--text-faint);margin-top:0.3rem">${cp.intensity_rationale || ''}</div>
        </div>

        <!-- Rapor & UTBK -->
        ${(ru.avg_rapor_accepted || ru.avg_utbk_accepted) ? `
        <div class="comp-profile">
          <div class="comp-profile__title">Rapor & UTBK Profile</div>
          ${ru.avg_rapor_accepted ? `<div class="comp-profile__row"><span>Avg Rapor (Accepted)</span><span>${ru.avg_rapor_accepted}</span></div>` : ''}
          ${ru.avg_utbk_accepted ? `<div class="comp-profile__row"><span>Avg UTBK (Accepted)</span><span>${ru.avg_utbk_accepted}</span></div>` : ''}
          ${ru.rapor_note ? `<div style="font-size:0.6rem;color:var(--text-faint);margin-top:0.2rem">${ru.rapor_note}</div>` : ''}
          ${ru.utbk_note ? `<div style="font-size:0.6rem;color:var(--text-faint)">${ru.utbk_note}</div>` : ''}
          ${ru.data_caveat ? `<div style="font-size:0.55rem;color:var(--yellow);margin-top:0.2rem">⚠ ${ru.data_caveat}</div>` : ''}
        </div>` : ''}

        <!-- Admission Pathways -->
        ${pw.length ? `
        <div class="pathways">
          <div class="pathways__header" onclick="togglePathway('${pwId}')">
            <span>Admission Pathways (${pw.length})</span>
            <span class="archives__arrow" id="${pwId}-arrow">▼</span>
          </div>
          <div class="pathways__body" id="${pwId}">
            ${pw.map(p => `
              <div class="pathway-row">
                <div class="pathway-row__name">${p.name} <span style="color:var(--text-faint)">(${p.type})</span></div>
                <div class="pathway-row__detail">Fee: ${p.registration_fee_idr ? formatIDR(p.registration_fee_idr) : 'Free / Not listed'}</div>
                <div class="pathway-row__detail">UKT: ${p.ukt_range || '—'}</div>
                <div class="pathway-row__detail">${p.requirements_summary}</div>
                ${p.open_period ? `<div class="pathway-row__detail">Period: ${p.open_period}</div>` : ''}
                ${p.notes ? `<div class="pathway-row__detail" style="color:var(--text-faint)">${p.notes}</div>` : ''}
              </div>
            `).join('')}
          </div>
        </div>` : ''}

        <!-- Career Prospects -->
        <div class="career-panel">
          <div class="career-panel__title">Career Prospects</div>
          <div class="career-panel__roles">
            ${(ca.top_roles || []).map(r => `<span class="role-tag">${r}</span>`).join('')}
          </div>
          ${ca.avg_starting_salary_idr ? `<div class="career-panel__salary">${formatIDR(ca.avg_starting_salary_idr)} avg starting</div>` : ''}
          ${ca.salary_range ? `<div style="font-size:0.6rem;color:var(--text-dim);margin-bottom:0.3rem">${ca.salary_range}</div>` : ''}
          ${ca.job_market_demand ? `<div class="career-panel__demand">Demand: <span class="demand-badge demand-badge--${ca.job_market_demand}">${ca.job_market_demand.toUpperCase()}</span></div>` : ''}
          ${ca.demand_rationale ? `<div class="career-panel__outlook">${ca.demand_rationale}</div>` : ''}
          ${ca.growth_outlook ? `<div class="career-panel__outlook" style="margin-top:0.3rem;color:var(--gold-dim)">${ca.growth_outlook}</div>` : ''}
          ${ca.data_caveat ? `<div style="font-size:0.55rem;color:var(--yellow);margin-top:0.2rem">⚠ ${ca.data_caveat}</div>` : ''}
        </div>

        <!-- Insight -->
        <div class="insight-block">
          <div class="insight-block__headline">${ins.headline || ''}</div>
          ${ins.acceptance_context ? `<div class="insight-block__text">${ins.acceptance_context}</div>` : ''}
          ${ins.score_context ? `<div class="insight-block__text">${ins.score_context}</div>` : ''}
          ${ins.rapor_utbk_context ? `<div class="insight-block__text">${ins.rapor_utbk_context}</div>` : ''}
          ${ins.trend_signal ? `<div class="insight-block__text">${ins.trend_signal}</div>` : ''}
          ${ins.risk_assessment ? `<div class="insight-block__risk">${ins.risk_assessment}</div>` : ''}
          ${ins.strategic_note ? `<div class="insight-block__strategic">${ins.strategic_note}</div>` : ''}
        </div>

        <!-- Data Quality -->
        <div class="dq-bar">
          <span class="dq-dot dq-dot--${dq.confidence || 'medium'}"></span>
          <span>${(dq.confidence || 'medium').toUpperCase()} confidence</span>
          <span>&middot; Sources: [${(dq.source_ids || []).join(', ')}]</span>
          ${dq.caveat ? `<span style="color:var(--yellow)">&middot; ${dq.caveat}</span>` : ''}
        </div>

        ${m.crowding_risk === 'high' ? '<div class="rec-card__warning">This program\'s recent score drop may attract significantly more applicants this cycle. Proceed with caution.</div>' : ''}
      </div>`;
  }).join('');

  runCountUp();
}

function togglePathway(id) {
  const body = document.getElementById(id);
  const arrow = document.getElementById(id + '-arrow');
  if (!body) return;
  body.classList.toggle('is-open');
  if (arrow) arrow.classList.toggle('is-open');
}

// ── Comparative Summary ──────────────────────────────────────────
function renderComparativeSummary() {
  const el = document.getElementById('comp-summary');
  const cs = S.data.analysis ? S.data.analysis.comparative_summary : null;
  if (!cs) { el.classList.add('hidden'); return; }
  el.classList.remove('hidden');
  el.innerHTML = `
    <div class="comp-summary__title">Comparative Summary — Rank 1 vs Rank 2</div>
    <div class="comp-summary__row">
      <div class="comp-summary__item">
        <div class="comp-summary__label">Head to Head</div>
        <div class="comp-summary__val">${cs.vs_each_other || ''}</div>
      </div>
      <div class="comp-summary__item">
        <div class="comp-summary__label">Key Tradeoff</div>
        <div class="comp-summary__val">${cs.key_tradeoff || ''}</div>
      </div>
    </div>
    <div class="comp-summary__row">
      <div class="comp-summary__item">
        <div class="comp-summary__label">Safer Pick</div>
        <div class="comp-summary__val">
          <span class="safer-pick">${cs.safer_pick === 'rank_1' ? 'RANK 1' : cs.safer_pick === 'rank_2' ? 'RANK 2' : 'TIED'}</span>
          <span style="margin-left:0.5rem;font-size:0.65rem;color:var(--text-dim)">${cs.safer_pick_reason || ''}</span>
        </div>
      </div>
      <div class="comp-summary__item">
        <div class="comp-summary__label">Career Comparison</div>
        <div class="comp-summary__val">${cs.career_comparison || ''}</div>
      </div>
    </div>
    ${cs.cost_comparison ? `<div style="font-size:0.65rem;color:var(--text-faint);margin-top:0.5rem">${cs.cost_comparison}</div>` : ''}
  `;
}

// ── Stats Strip ──────────────────────────────────────────────────
function renderStats() {
  const m = S.data.meta;
  const crowdingVal = m.highest_crowding_risk || 'N/A';
  document.getElementById('stat-strip').innerHTML = [
    [m.total_programs, 'Total Programs', true],
    [m.avg_acceptance_rate, 'Avg Acceptance %', false],
    [m.lowest_min_score, 'Lowest Score', true],
    [m.highest_competition_ratio, 'Top Competition', null],
    [crowdingVal, 'Highest Crowding Risk', null],
  ].map(([v, l, isInt], i) => {
    const isLast = i === 4;
    const style = isLast ? 'color: var(--yellow);' : '';
    return `
    <div class="stat-cell reveal" style="animation-delay:${0.05 * i}s">
      <div class="stat-cell__val ${isInt !== null ? 'count-up' : ''}" ${isInt !== null ? `data-v="${v}" data-int="${isInt}"` : ''} style="${style}font-size:${isLast ? '1rem' : ''}">${v}</div>
      <div class="stat-cell__label">${l}</div>
    </div>`;
  }).join('');
  runCountUp();
}

// ── Charts ───────────────────────────────────────────────────────
function renderCharts() {
  const { programs, analysis } = S.data;
  const recs = analysis ? analysis.recommendations : [];
  const recIds = recs.map(r => r.program_id);

  Chart.defaults.color = '#8a8478';
  Chart.defaults.font.family = "'IBM Plex Mono', monospace";
  Chart.defaults.font.size = 11;

  const ttip = {
    backgroundColor: '#0f0f0f', titleColor: '#f2ede6', bodyColor: '#d4a843',
    borderColor: '#1a1a1a', borderWidth: 1, padding: 10, cornerRadius: 0,
  };
  const grid = { color: 'rgba(255,255,255,0.04)' };

  // Chart A: Acceptance rates (top 10)
  const byRate = [...programs].sort((a, b) => b.acceptance_rate - a.acceptance_rate).slice(0, 10);
  if (S.charts.a) S.charts.a.destroy();
  S.charts.a = new Chart(document.getElementById('chartAcceptance'), {
    type: 'bar',
    data: {
      labels: byRate.map(p => (p.name || p.program || '').length > 22 ? (p.name || p.program).slice(0, 22) + '...' : (p.name || p.program)),
      datasets: [{
        data: byRate.map(p => p.acceptance_rate),
        backgroundColor: byRate.map(p => recIds.includes(p.name || p.id) ? '#d4a843' : '#1a1a1a'),
        borderColor: byRate.map(p => recIds.includes(p.name || p.id) ? '#d4a843' : '#2a2a2a'),
        borderWidth: 1, borderRadius: 0,
      }]
    },
    options: {
      indexAxis: 'y', responsive: true, maintainAspectRatio: false,
      animation: { duration: 800 },
      plugins: { legend: { display: false }, tooltip: ttip },
      scales: { x: { grid }, y: { grid: { display: false } } }
    }
  });

  // Chart B: Lowest scores (top 10)
  const byScore = [...programs].filter(p => p.avg_min_score).sort((a, b) => a.avg_min_score - b.avg_min_score).slice(0, 10);
  const yMin = Math.max(0, Math.min(...byScore.map(p => p.avg_min_score)) - 30);
  if (S.charts.b) S.charts.b.destroy();
  S.charts.b = new Chart(document.getElementById('chartScores'), {
    type: 'bar',
    data: {
      labels: byScore.map(p => (p.name || p.program || '').length > 16 ? (p.name || p.program).slice(0, 16) + '...' : (p.name || p.program)),
      datasets: [{
        data: byScore.map(p => p.avg_min_score),
        backgroundColor: byScore.map(p => recIds.includes(p.name || p.id) ? '#d4a843' : '#1a1a1a'),
        borderColor: byScore.map(p => recIds.includes(p.name || p.id) ? '#d4a843' : '#2a2a2a'),
        borderWidth: 1, borderRadius: 0,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      animation: { duration: 800 },
      plugins: { legend: { display: false }, tooltip: ttip },
      scales: { x: { grid: { display: false } }, y: { grid, min: yMin } }
    }
  });

  // Chart C: Trend lines (top 5 by ease_score)
  const top5 = [...programs].sort((a, b) => b.ease_score - a.ease_score).slice(0, 5);
  const palette = ['#d4a843', '#f2ede6', '#8a8478', '#5a9a6b', '#b35a5a'];
  if (S.charts.c) S.charts.c.destroy();
  S.charts.c = new Chart(document.getElementById('chartTrend'), {
    type: 'line',
    data: {
      labels: ['2022', '2023', '2024'],
      datasets: top5.map((p, i) => ({
        label: p.name || p.program,
        data: [p.min_score_2022 || (p.scores && p.scores['2022']), p.min_score_2023 || (p.scores && p.scores['2023']), p.min_score_2024 || (p.scores && p.scores['2024'])],
        borderColor: palette[i], backgroundColor: palette[i] + '15',
        fill: true, tension: 0.3, pointRadius: 4, pointHoverRadius: 6,
        pointBackgroundColor: palette[i], borderWidth: 1.5,
      }))
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      animation: { duration: 800 },
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 10, padding: 20, font: { size: 10 } } },
        tooltip: ttip
      },
      scales: { x: { grid }, y: { grid } }
    }
  });

  // Chart D: Volatility vs Acceptance (Scatter)
  const riskColor = r => r === 'high' ? '#b35a5a' : r === 'moderate' ? '#c4a94d' : '#5a9a6b';
  const maxVol = Math.max(...programs.map(p => p.volatility_index || 0), 0.01);
  if (S.charts.d) S.charts.d.destroy();
  S.charts.d = new Chart(document.getElementById('chartScatter'), {
    type: 'scatter',
    data: {
      datasets: [{
        data: programs.map(p => ({
          x: p.volatility_index || 0, y: p.acceptance_rate,
          r: Math.max(4, Math.min(14, (p.ease_score || 0) * 0.8)),
          program: p.name || p.program, crowding: p.crowding_risk,
          penalty: p.crowding_penalty, isRec: recIds.includes(p.name || p.id),
        })),
        backgroundColor: programs.map(p => riskColor(p.crowding_risk) + '99'),
        borderColor: programs.map(p => recIds.includes(p.name || p.id) ? '#d4a843' : riskColor(p.crowding_risk)),
        borderWidth: programs.map(p => recIds.includes(p.name || p.id) ? 2.5 : 1),
        pointRadius: programs.map(p => Math.max(4, Math.min(14, (p.ease_score || 0) * 0.8))),
        pointHoverRadius: programs.map(p => Math.max(6, Math.min(16, (p.ease_score || 0) * 0.8 + 2))),
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      animation: { duration: 800 },
      plugins: {
        legend: { display: false },
        tooltip: {
          ...ttip,
          callbacks: {
            title: ctx => ctx[0]?.raw?.program || '',
            label: ctx => {
              const d = ctx.raw;
              return [
                `Acceptance: ${d.y}%`, `Volatility: ${(d.x * 100).toFixed(2)}%`,
                `Crowding: ${d.crowding} (penalty: ${(d.penalty||0).toFixed(2)})`,
                d.isRec ? '★ Recommended' : '',
              ].filter(Boolean);
            }
          }
        },
      },
      scales: {
        x: { title: { display: true, text: 'Volatility Index', color: '#8a8478', font: { size: 10 } }, grid, min: 0, max: Math.ceil(maxVol * 120) / 100 },
        y: { title: { display: true, text: 'Acceptance Rate (%)', color: '#8a8478', font: { size: 10 } }, grid, min: 0 }
      }
    },
    plugins: [{
      id: 'quadrantLabels',
      afterDraw(chart) {
        const { ctx, chartArea: { left, right, top, bottom } } = chart;
        const midX = (left + right) / 2, midY = (top + bottom) / 2;
        ctx.save();
        ctx.font = "600 8px 'IBM Plex Mono', monospace";
        ctx.globalAlpha = 0.12; ctx.fillStyle = '#f2ede6'; ctx.textAlign = 'center';
        ctx.fillText('SAFE ZONE', (left + midX) / 2, top + 18);
        ctx.fillText('RISKY', (midX + right) / 2, top + 18);
        ctx.fillText('STABLE BUT COMPETITIVE', (left + midX) / 2, bottom - 8);
        ctx.fillText('AVOID', (midX + right) / 2, bottom - 8);
        ctx.restore();
      }
    }]
  });
}

// ── Table Renderer ───────────────────────────────────────────────
function renderTable() {
  const { programs, analysis } = S.data;
  const recs = analysis ? analysis.recommendations : [];
  const recIds = recs.map(r => r.program_id);
  const { sortCol, sortDir } = S;

  const sorted = [...programs].sort((a, b) => {
    let va = a[sortCol], vb = b[sortCol];
    if (typeof va === 'string') return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    return sortDir === 'asc' ? (va||0) - (vb||0) : (vb||0) - (va||0);
  });

  document.querySelectorAll('th[data-col]').forEach(th => {
    const c = th.dataset.col;
    const arrow = th.querySelector('.sort-arrow');
    if (arrow) arrow.textContent = c === sortCol ? (sortDir === 'asc' ? '\u25B2' : '\u25BC') : '';
  });

  const maxVol = Math.max(...programs.map(p => p.volatility_index || 0), 0.001);
  document.getElementById('table-body').innerHTML = sorted.map((p, i) => {
    const top = recIds.includes(p.name || p.id);
    const vi = p.volatility_index || 0;
    const volPct = Math.min((vi / maxVol) * 100, 100);
    const volLevel = p.crowding_risk || 'low';
    const pName = p.name || p.program || '';
    return `<tr class="${top ? 'row-top' : ''}">
      <td>${i + 1}</td>
      <td class="col-program">${pName}</td>
      <td class="t-small">${p.faculty}</td>
      <td>${p.capacity || p.quota_mandiri || ''}</td>
      <td>${p.applicants || p.applicants_mandiri || ''}</td>
      <td class="col-rate">${p.acceptance_rate}%</td>
      <td>${p.avg_min_score || ''}</td>
      <td class="${trendClass(p.score_trend || '')}">${trendArrow(p.score_trend || '')} ${trendText(p.score_trend || '')}</td>
      <td><span class="vol-bar vol-bar--${volLevel}" style="width:${Math.max(volPct, 4)}px;" title="${(vi * 100).toFixed(2)}%"></span> <span style="font-size:9px;color:var(--text-faint)">${(vi * 100).toFixed(1)}%</span></td>
      <td><span class="crowding-badge crowding-badge--${p.crowding_risk || 'low'}">${crowdLabel(p.crowding_risk || 'low')}</span></td>
      <td class="col-ease">${parseFloat(p.ease_score || 0).toFixed(1)}</td>
      <td><span class="source-pip ${srcDot(p.source_type || 'hardcoded')}" title="${p.source_type || 'hardcoded'}"></span></td>
    </tr>`;
  }).join('');
}

// ── Archives ─────────────────────────────────────────────────────
async function fetchArchives(id) {
  try {
    const r = await fetch(`${API}/archives/${id}`);
    const d = await r.json();
    if (d.error) throw new Error(d.message);
    S.archives = d;
    renderArchives();
  } catch (e) {
    console.warn('[archives]', e.message);
    S.archives = null;
    renderArchivesReset();
  }
}

function renderArchivesReset() {
  document.getElementById('archives-count').textContent = '';
  document.getElementById('archives-sources').innerHTML = '';
  document.getElementById('archives-table-body').innerHTML = '';
  S.archivesOpen = false;
  document.getElementById('archives-body').classList.remove('is-open');
  document.getElementById('archives-arrow').classList.remove('is-open');
}

function renderArchives() {
  const a = S.archives;
  if (!a) return;

  document.getElementById('archives-count').textContent =
    `${a.total_programs} programs  /  ${(a.sources || []).length} sources`;

  // Source cards
  document.getElementById('archives-sources').innerHTML = (a.sources || []).map(s => `
    <div class="src-card reveal" style="animation-delay:${s.id * 0.06}s">
      <div class="src-card__title">
        <span class="reliability-dot reliability-dot--${s.reliability}"></span>
        ${s.title}
        <span class="src-badge src-badge--${s.type}">${s.type.replace(/-/g, ' ')}</span>
      </div>
      <div class="src-card__meta">${s.publisher} &middot; Accessed ${s.accessed}</div>
      ${s.notes ? `<div class="src-card__meta" style="margin-top:0.25rem;color:var(--text-faint);">${s.notes}</div>` : ''}
      <a class="src-card__link" href="${s.url}" target="_blank" rel="noopener">[${s.id}] ${s.publisher} &rarr;</a>
    </div>
  `).join('');

  // Archive table
  document.getElementById('archives-table-body').innerHTML = (a.programs || []).map(p => {
    const refs = (p.source_ref || []).map(idx => {
      const src = (a.sources || []).find(s => s.id === idx);
      return src
        ? `<a class="cite-link" href="${src.url}" target="_blank" title="${src.title}">${idx}</a>`
        : `<span class="cite-link">${idx}</span>`;
    }).join('');
    const typeBadge = p.source_type || p.data_confidence || 'estimated';
    const pName = p.name || p.program || '';
    return `<tr>
      <td style="color:var(--text);font-weight:500;">${pName}</td>
      <td>${p.faculty}</td>
      <td>${p.capacity || p.quota_mandiri || ''}</td>
      <td>${p.applicants || p.applicants_mandiri || ''}</td>
      <td>${p.acceptance_rate}%</td>
      <td>${(p.scores && p.scores['2022']) || p.min_score_2022 || '—'}</td>
      <td>${(p.scores && p.scores['2023']) || p.min_score_2023 || '—'}</td>
      <td>${(p.scores && p.scores['2024']) || p.min_score_2024 || '—'}</td>
      <td><span class="source-pip source-pip--${srcDot(typeBadge).split('--')[1]}" title="${typeBadge}"></span> ${typeBadge}</td>
      <td><div class="cite-links">${refs}</div></td>
    </tr>`;
  }).join('');
}

// ── Events ───────────────────────────────────────────────────────
document.getElementById('refresh-btn').addEventListener('click', () => {
  if (!S.uni || S.loading) return;
  const btn = document.getElementById('refresh-btn');
  btn.disabled = true;
  btn.textContent = 'Scraping...';
  fetchData(S.uni, true);
});

document.querySelectorAll('th[data-col]').forEach(th => {
  th.addEventListener('click', () => {
    const c = th.dataset.col;
    if (!c || !S.data) return;
    if (S.sortCol === c) S.sortDir = S.sortDir === 'asc' ? 'desc' : 'asc';
    else { S.sortCol = c; S.sortDir = 'desc'; }
    renderTable();
  });
});

document.getElementById('archives-toggle').addEventListener('click', () => {
  S.archivesOpen = !S.archivesOpen;
  document.getElementById('archives-body').classList.toggle('is-open', S.archivesOpen);
  document.getElementById('archives-arrow').classList.toggle('is-open', S.archivesOpen);
});

// ── Entry Page ───────────────────────────────────────────────────
let _booted = false;
function enterApp() {
  const entry = document.getElementById('entry-page');
  const app = document.getElementById('main-app');
  entry.classList.add('is-exiting');
  setTimeout(() => {
    entry.style.display = 'none';
    app.style.display = '';
    if (!_booted) {
      _booted = true;
      bootApp();
    }
  }, 600);
}

async function bootApp() {
  const unis = await fetchUnis();
  renderSelector(unis);
  if (unis.length) pick('ugm');
}

// ── Boot ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Entry page stat counter animation
  ['e-unis','e-progs','e-paths'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const end = parseInt(el.textContent);
    if (isNaN(end)) return;
    animateNum(el, end, 1200);
  });
});
