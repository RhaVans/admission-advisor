'use strict';
require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');
const { scrape, UNIVERSITY_NAMES } = require('./scrapers/index');
const { getCache, setCache, clearCache, cacheStatus } = require('./utils/cache');

const HARDCODED_DIR = path.join(__dirname, '../data/hardcoded');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const UNIVERSITIES = [
  { id: 'ugm',   name: 'Universitas Gadjah Mada',              type: 'S1', exam: 'UM UGM' },
  { id: 'ui',    name: 'Universitas Indonesia',                 type: 'S1', exam: 'SIMAK UI' },
  { id: 'itb',   name: 'Institut Teknologi Bandung',            type: 'S1', exam: 'USM ITB' },
  { id: 'its',   name: 'Institut Teknologi Sepuluh Nopember',   type: 'S1', exam: 'SM ITS' },
  { id: 'unpad', name: 'Universitas Padjadjaran',               type: 'S1', exam: 'SMUP Unpad' },
  { id: 'ub',    name: 'Universitas Brawijaya',                 type: 'S1', exam: 'Selma UB' },
  { id: 'upn_jogja', name: 'UPN Veteran Yogyakarta',            type: 'S1', exam: 'SMM UPN' },
  { id: 'undip', name: 'Universitas Diponegoro',                type: 'S1', exam: 'UM Undip' },
  { id: 'upi',   name: 'Universitas Pendidikan Indonesia',      type: 'S1', exam: 'SM UPI' },
  { id: 'unair', name: 'Universitas Airlangga',                 type: 'S1', exam: 'Mandiri Unair' },
  { id: 'unhas', name: 'Universitas Hasanuddin',                type: 'S1', exam: 'SM Unhas' },
  { id: 'usu',   name: 'Universitas Sumatera Utara',            type: 'S1', exam: 'SMM USU' },
  { id: 'poltekniknhi', name: 'Politeknik Pariwisata NHI Bandung', type: 'D4', exam: 'Sipenmaru NHI' },
  { id: 'polmak', name: 'Politeknik Negeri Makassar',           type: 'D4', exam: 'SM Polimak' },
];
const VALID_IDS = new Set(UNIVERSITIES.map(u => u.id));

// ── GET /api/universities ─────────────────────────────────────────────────
app.get('/api/universities', (_req, res) => {
  res.json(UNIVERSITIES);
});

// ── GET /api/health ───────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  const status = cacheStatus(UNIVERSITIES.map(u => u.id));
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    cache: status,
  });
});

// ── GET /api/admissions/:universityId ─────────────────────────────────────
app.get('/api/admissions/:universityId', async (req, res) => {
  const { universityId } = req.params;
  if (!VALID_IDS.has(universityId)) {
    return res.status(404).json({ error: true, message: `University '${universityId}' not found.` });
  }

  // 1. Check cache
  const cached = getCache(universityId);
  if (cached) {
    console.log(`[cache] Serving cached data for ${universityId}`);
    return res.json({ ...cached, source: 'cache' });
  }

  // 2. Scrape (official → affiliated → fallback)
  try {
    const data = await scrape(universityId);
    setCache(universityId, data);
    return res.json(data);
  } catch (err) {
    console.error(`[server] All sources failed for ${universityId}:`, err.message);
    return res.status(500).json({
      error: true,
      message: 'All data sources failed. Please try again later.',
      source: 'none',
    });
  }
});

// ── GET /api/admissions/:universityId/refresh ─────────────────────────────
app.get('/api/admissions/:universityId/refresh', async (req, res) => {
  const { universityId } = req.params;
  if (!VALID_IDS.has(universityId)) {
    return res.status(404).json({ error: true, message: `University '${universityId}' not found.` });
  }

  clearCache(universityId);
  console.log(`[refresh] Cache cleared for ${universityId}, scraping fresh…`);

  try {
    const data = await scrape(universityId);
    setCache(universityId, data);
    return res.json(data);
  } catch (err) {
    console.error(`[server] Refresh failed for ${universityId}:`, err.message);
    return res.status(500).json({
      error: true,
      message: 'Refresh failed. All data sources unavailable.',
      source: 'none',
    });
  }
});

// ── GET /api/archives/:universityId ───────────────────────────────────────
// Serves raw dataset with full source citations for the Data Archives view.
app.get('/api/archives/:universityId', (req, res) => {
  const { universityId } = req.params;
  if (!VALID_IDS.has(universityId)) {
    return res.status(404).json({ error: true, message: `University '${universityId}' not found.` });
  }

  const file = path.join(HARDCODED_DIR, `${universityId}.json`);
  if (!fs.existsSync(file)) {
    return res.status(404).json({ error: true, message: `No archive data for '${universityId}'.` });
  }

  try {
    const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
    return res.json({
      university: raw.university,
      university_name: raw.university_name,
      sources: raw.sources || [],
      programs: raw.programs || [],
      total_programs: (raw.programs || []).length,
      archive_date: new Date().toISOString(),
    });
  } catch (err) {
    console.error(`[archives] Failed to load ${universityId}:`, err.message);
    return res.status(500).json({ error: true, message: 'Failed to load archive data.' });
  }
});

// ── Catch-all → index.html ────────────────────────────────────────────────
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n🟣 Uni Advisor running at http://localhost:${PORT}`);
    console.log(`   API: /api/universities | /api/admissions/:id | /api/archives/:id | /api/health\n`);
  });
}

module.exports = app;
