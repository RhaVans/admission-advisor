// ══════════════════════════════════════════════════════════════════
// Admission Advisor v2 — Frontend Application
// ══════════════════════════════════════════════════════════════════

const S = {
  uni: null, data: null, loading: false,
  sortCol: 'ease_score', sortDir: 'desc',
  charts: {},
  archives: null, archivesOpen: false,
  meta: [] // university list cache
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
const crowdColor = r => r === 'high' ? 'var(--danger)' : r === 'moderate' ? 'var(--warning)' : 'var(--success)';
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

// ── Theme Toggle ─────────────────────────────────────────────────
function initTheme() {
  const saved = localStorage.getItem('aria-theme');
  if (saved === 'dark') document.body.classList.add('dark-theme');
  updateThemeIcon();
}

function toggleTheme() {
  document.body.classList.toggle('dark-theme');
  const isDark = document.body.classList.contains('dark-theme');
  localStorage.setItem('aria-theme', isDark ? 'dark' : 'light');
  updateThemeIcon();
  // Re-render charts with new colors
  if (S.data) renderCharts();
}

function updateThemeIcon() {
  const icon = document.getElementById('theme-icon');
  if (!icon) return;
  const isDark = document.body.classList.contains('dark-theme');
  icon.innerHTML = isDark
    ? '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>'
    : '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
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
  
  const tb = document.getElementById('table-body');
  if (tb) {
    tb.innerHTML = Array(5).fill(`<tr>${Array(10).fill('<td><div class="skel skel--line"></div></td>').join('')}</tr>`).join('');
  }
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
  const container = document.getElementById('university-selector');

  S.meta = unis; // cache for pick()

  const shortName = u => u.id.replace(/_/g, ' ').toUpperCase();

  const html = unis.map(u => `
    <div class="selector__card" onclick="pick('${u.id}')" id="sel-${u.id}">
      <span class="selector__id">${shortName(u)}</span>
      <span class="selector__name">${u.exam || u.type || ''}</span>
    </div>
  `).join('');
  container.innerHTML = html;

  const mobileHtml = unis.map(u => `
    <button class="mobile-uni-card" onclick="pick('${u.id}'); toggleMobileDrawer();" id="msel-${u.id}">
      <div class="mobile-uni-card__title">${shortName(u)}</div>
      <div class="mobile-uni-card__sub">${u.name || ''} &middot; ${u.exam || ''}</div>
    </button>
  `).join('');
  const mobileSel = document.getElementById('mobile-university-selector');
  if (mobileSel) mobileSel.innerHTML = mobileHtml;
}

function pick(id) {
  if (S.loading) return;
  S.uni = id;
  document.querySelectorAll('.selector__card').forEach(el => el.classList.remove('is-active'));
  const selEl = document.getElementById(`sel-${id}`);
  if (selEl) selEl.classList.add('is-active');

  // Mobile updates
  document.querySelectorAll('.mobile-uni-card').forEach(el => el.classList.remove('active'));
  const mSel = document.getElementById(`msel-${id}`);
  if (mSel) mSel.classList.add('active');
  const u = S.meta.find(x => x.id === id);
  if (u) {
    const bottomPill = document.getElementById('mobile-bottom-pill');
    if (bottomPill) bottomPill.textContent = u.id.replace(/_/g, ' ').toUpperCase();
  }
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

  // (Source bar removed from design spec, but we could add it back if needed. Skipping for now to match formal layout)
  // (Uni Info Bar removed from design spec, skipping)
  renderRecs();
  renderComparativeSummary();
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
      <div class="rec-card ${i === 0 ? 'rank-1' : ''}">
        <div class="rec-card__rank">RANK ${rec.rank}</div>
        <h3 class="rec-card__program">${rec.program}</h3>
        <div class="rec-card__faculty">${rec.faculty} &middot; ${rec.program_type}</div>

        <!-- Core metrics grid -->
        <div class="rec-metrics">
          <div class="rec-metric">
            <div class="rec-metric__label">Acceptance</div>
            <div class="rec-metric__val"><span class="count-up" data-v="${m.acceptance_rate_pct || 0}">${m.acceptance_rate_pct || 0}</span>%</div>
          </div>
          <div class="rec-metric">
            <div class="rec-metric__label">Avg Score</div>
            <div class="rec-metric__val">${m.avg_min_score || '—'}</div>
          </div>
          <div class="rec-metric">
            <div class="rec-metric__label">Ease Score</div>
            <div class="rec-metric__val t-primary">${(m.ease_score || 0).toFixed(1)}</div>
          </div>
        </div>

        <!-- Insight -->
        <div class="rec-insight">
          <div style="font-weight: 600; margin-bottom: 0.5rem; color: var(--primary);">${ins.headline || 'Strategic Overview'}</div>
          <p style="margin-bottom: 0.5rem;">${ins.acceptance_context || ''} ${ins.score_context || ''}</p>
          <p style="font-style: italic; color: var(--text-secondary);">${ins.strategic_note || ''}</p>
        </div>

        <!-- Sources -->
        <div class="rec-sources">
          ${(dq.source_ids || []).map(sid => `<span class="source-chip">${sid}</span>`).join('')}
        </div>

        ${m.crowding_risk === 'high' ? '<div class="rec-card__warning" style="background:#FEE2E2; color:#991B1B; border:1px solid #991B1B; padding:0.5rem; font-size:var(--text-xs); margin-top:1rem;">This program\'s recent score drop may attract significantly more applicants this cycle. Proceed with caution.</div>' : ''}
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

  const isMobile = window.innerWidth <= 768;
  const isDark = document.body.classList.contains('dark-theme');
  const textColor = isDark ? '#94A3B8' : '#4A4A6A';
  const gridColor = isDark ? 'rgba(51, 65, 85, 0.4)' : 'rgba(214, 207, 196, 0.4)';
  const ttipBg = isDark ? '#151F32' : '#FFFFFF';
  const ttipTitle = isDark ? '#F8FAFC' : '#1B3A6B';
  const ttipBody = isDark ? '#94A3B8' : '#4A4A6A';

  Chart.defaults.color = textColor;
  Chart.defaults.font.family = "'Inter', sans-serif";
  Chart.defaults.font.size = 11;

  const ttip = {
    backgroundColor: ttipBg, titleColor: ttipTitle, bodyColor: ttipBody,
    borderColor: '#B8960C', borderWidth: 1, padding: 10, cornerRadius: 2,
    titleFont: { family: "'Cormorant Garamond', serif", size: 14, weight: 'bold' }
  };

  const customTooltip = function(context) {
    const tooltipModel = context.tooltip;
    if (tooltipModel.opacity === 0) return;
    const title = tooltipModel.title || [];
    const body = tooltipModel.body ? tooltipModel.body.map(b => b.lines).join('<br>') : '';
    const html = `<div style="font-weight:600; margin-bottom:0.5rem; color:var(--primary); font-family:var(--font-display); font-size:1.1rem; border-bottom:1px solid var(--border); padding-bottom:0.5rem;">${title}</div><div style="font-size:0.9rem;">${body}</div>`;
    openChartTooltip(html);
  };

  const tooltipPlugin = isMobile ? { enabled: false, external: customTooltip } : { ...ttip };
  const grid = { color: gridColor, borderDash: [4, 4] };

  // Chart A: Acceptance rates (top 10)
  const byRate = [...programs].sort((a, b) => b.acceptance_rate - a.acceptance_rate).slice(0, 10);
  if (S.charts.a) S.charts.a.destroy();
  S.charts.a = new Chart(document.getElementById('chartAcceptance'), {
    type: 'bar',
    data: {
      labels: byRate.map(p => (p.name || p.program || '').length > 22 ? (p.name || p.program).slice(0, 22) + '...' : (p.name || p.program)),
      datasets: [{
        data: byRate.map(p => p.acceptance_rate),
        backgroundColor: byRate.map(p => recIds.includes(p.name || p.id) ? '#B8960C' : '#1B3A6B'),
        borderColor: byRate.map(p => recIds.includes(p.name || p.id) ? '#B8960C' : '#1B3A6B'),
        borderWidth: 1, borderRadius: 0,
      }]
    },
    options: {
      indexAxis: 'y', responsive: true, maintainAspectRatio: false,
      animation: { duration: 800 },
      plugins: { legend: { display: false }, tooltip: tooltipPlugin },
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
        backgroundColor: byScore.map(p => recIds.includes(p.name || p.id) ? '#B8960C' : '#1B3A6B'),
        borderColor: byScore.map(p => recIds.includes(p.name || p.id) ? '#B8960C' : '#1B3A6B'),
        borderWidth: 1, borderRadius: 0,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      animation: { duration: 800 },
      plugins: { legend: { display: false }, tooltip: tooltipPlugin },
      scales: { x: { grid: { display: false } }, y: { grid, min: yMin } }
    }
  });

  // Chart C: Trend lines (top 5 by ease_score)
  const top5 = [...programs].sort((a, b) => b.ease_score - a.ease_score).slice(0, 5);
  const palette = ['#1B3A6B', '#9B1D20', '#B8960C', '#2D6A4F', '#4A4A6A'];
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
        tooltip: tooltipPlugin
      },
      scales: { x: { grid }, y: { grid } }
    }
  });

  // Chart D: Volatility vs Acceptance (Scatter)
  const riskColor = r => r === 'high' ? '#9B1D20' : r === 'moderate' ? '#A05C00' : '#2D6A4F';
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
        borderColor: programs.map(p => recIds.includes(p.name || p.id) ? '#1B3A6B' : riskColor(p.crowding_risk)),
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
        tooltip: isMobile ? tooltipPlugin : {
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
        x: { title: { display: true, text: 'Volatility Index', color: textColor, font: { size: 10 } }, grid, min: 0, max: Math.ceil(maxVol * 120) / 100 },
        y: { title: { display: true, text: 'Acceptance Rate (%)', color: textColor, font: { size: 10 } }, grid, min: 0 }
      }
    },
    plugins: [{
      id: 'quadrantLabels',
      afterDraw(chart) {
        const { ctx, chartArea: { left, right, top, bottom } } = chart;
        const midX = (left + right) / 2, midY = (top + bottom) / 2;
        ctx.save();
        ctx.font = "600 8px 'Inter', sans-serif";
        ctx.globalAlpha = 0.4; ctx.fillStyle = textColor; ctx.textAlign = 'center';
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
    const pName = p.name || p.program || '';
    
    const EaseHtml = `
      <div style="text-align: right; line-height: 1.2;">
        <span style="font-weight: 600; font-family: var(--font-display); font-size: 1.125rem; color: var(--gold);">${parseFloat(p.ease_score || 0).toFixed(1)}</span>
        <div style="font-size: 0.6rem; color: var(--text-muted); text-transform: uppercase;">Ease</div>
      </div>
    `;

    return `<tr class="${top ? 'row-top' : ''}">
      <td style="color: var(--text-muted);">${i + 1}</td>
      <td data-col="name" class="col-program">
        <div>${pName}</div>
        <div class="mobile-only">${EaseHtml}</div>
      </td>
      <td data-col="faculty" class="text-secondary" style="font-style: italic;">${p.faculty || '—'}</td>
      <td data-col="capacity" class="desktop-only">${p.capacity || p.quota_mandiri || '—'}</td>
      <td data-col="applicants" class="desktop-only">${p.applicants || p.applicants_mandiri || '—'}</td>
      <td data-col="acceptance_rate" class="desktop-only" style="font-weight: 600; color: var(--primary);">${p.acceptance_rate || '—'}%</td>
      
      <td class="mobile-only">
        <div class="mobile-metric-row">
          <span>${p.capacity || p.quota_mandiri || '—'} Quota</span> &middot;
          <span>${p.applicants || p.applicants_mandiri || '—'} Applicants</span> &middot;
          <span>${p.acceptance_rate || '—'}% Rate</span>
        </div>
      </td>

      <td data-col="avg_min_score" class="desktop-only">${p.avg_min_score || '—'}</td>
      <td data-col="score_trend" class="desktop-only ${trendClass(p.score_trend || '')}">${trendArrow(p.score_trend || '')} ${trendText(p.score_trend || '')}</td>
      
      <td class="mobile-only">
        <div class="mobile-bottom-row">
          <span class="crowding-badge crowding-badge--${p.crowding_risk || 'low'}">${crowdLabel(p.crowding_risk || 'low')}</span>
          <span class="${trendClass(p.score_trend || '')}">${trendArrow(p.score_trend || '')} ${trendText(p.score_trend || '')}</span>
        </div>
      </td>

      <td data-col="crowding_risk" class="desktop-only"><span class="crowding-badge crowding-badge--${p.crowding_risk || 'low'}">${crowdLabel(p.crowding_risk || 'low')}</span></td>
      <td data-col="ease_score" class="col-ease desktop-only">${parseFloat(p.ease_score || 0).toFixed(1)}</td>
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
      <td data-col="name">
        <div style="font-weight:600; color:var(--primary);">${pName}</div>
      </td>
      <td data-col="faculty">${p.faculty || '—'}</td>
      <td class="desktop-only">${p.capacity || p.quota_mandiri || '—'}</td>
      <td class="desktop-only">${p.applicants || p.applicants_mandiri || '—'}</td>
      <td class="desktop-only">${p.acceptance_rate || '—'}%</td>
      
      <td class="mobile-only">
        <div class="mobile-metric-row">
          <span>${p.capacity || p.quota_mandiri || '—'} Quota</span> &middot;
          <span>${p.applicants || p.applicants_mandiri || '—'} Applicants</span> &middot;
          <span>${p.acceptance_rate || '—'}% Rate</span>
        </div>
        <div class="mobile-metric-row" style="margin-top: 0.5rem; justify-content: space-between;">
          <div style="font-family:var(--font-display); font-size:1rem;">2022: <span style="color:var(--gold);">${(p.scores && p.scores['2022']) || p.min_score_2022 || '—'}</span></div>
          <div style="font-family:var(--font-display); font-size:1rem;">2023: <span style="color:var(--gold);">${(p.scores && p.scores['2023']) || p.min_score_2023 || '—'}</span></div>
          <div style="font-family:var(--font-display); font-size:1rem;">2024: <span style="color:var(--gold);">${(p.scores && p.scores['2024']) || p.min_score_2024 || '—'}</span></div>
        </div>
      </td>

      <td class="desktop-only">${(p.scores && p.scores['2022']) || p.min_score_2022 || '—'}</td>
      <td class="desktop-only">${(p.scores && p.scores['2023']) || p.min_score_2023 || '—'}</td>
      <td class="desktop-only">${(p.scores && p.scores['2024']) || p.min_score_2024 || '—'}</td>
      <td class="desktop-only"><span class="source-pip source-pip--${srcDot(typeBadge).split('--')[1]}" title="${typeBadge}"></span> ${typeBadge}</td>
      <td class="desktop-only"><div class="cite-links">${refs}</div></td>
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

// ── Mobile UI Logic ──────────────────────────────────────────────
function toggleMobileDrawer() {
  const drawer = document.getElementById('mobile-drawer');
  const backdrop = document.getElementById('mobile-drawer-backdrop');
  if (drawer) drawer.classList.toggle('active');
  if (backdrop) backdrop.classList.toggle('active');
}

function openChartTooltip(html) {
  const content = document.getElementById('chart-tooltip-content');
  const sheet = document.getElementById('chart-tooltip-sheet');
  const backdrop = document.getElementById('chart-tooltip-backdrop');
  if (content && sheet && backdrop) {
    content.innerHTML = html;
    sheet.classList.add('active');
    backdrop.classList.add('active');
  }
}

function closeChartTooltip() {
  const sheet = document.getElementById('chart-tooltip-sheet');
  const backdrop = document.getElementById('chart-tooltip-backdrop');
  if (sheet) sheet.classList.remove('active');
  if (backdrop) backdrop.classList.remove('active');
}

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
  initTheme();
  
  // Entry page stat counter animation
  ['e-unis','e-progs','e-paths'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const end = parseInt(el.textContent);
    if (isNaN(end)) return;
    animateNum(el, end, 1200);
  });
});
