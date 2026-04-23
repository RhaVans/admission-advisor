'use strict';
const fs = require('fs');
const path = require('path');

const CACHE_DIR = path.join(__dirname, '../../data/cache');
const TTL_HOURS = parseInt(process.env.CACHE_TTL_HOURS || '24', 10);

let CACHE_WRITABLE = true;
try {
  if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
} catch {
  // Read-only filesystem (e.g. Vercel serverless) — cache disabled
  CACHE_WRITABLE = false;
}

function cacheFile(universityId) {
  return path.join(CACHE_DIR, `${universityId}.json`);
}

/**
 * Returns cached data if valid (within TTL), else null.
 */
function getCache(universityId) {
  const file = cacheFile(universityId);
  if (!fs.existsSync(file)) return null;
  try {
    const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
    const scraped = new Date(raw.scraped_at);
    const ageMs = Date.now() - scraped.getTime();
    if (ageMs < TTL_HOURS * 3600 * 1000) return raw;
    return null; // expired
  } catch {
    return null;
  }
}

/**
 * Persists data to cache with current timestamp.
 */
function setCache(universityId, data) {
  if (!CACHE_WRITABLE) return data;
  try {
    const payload = { ...data, scraped_at: new Date().toISOString() };
    fs.writeFileSync(cacheFile(universityId), JSON.stringify(payload, null, 2), 'utf8');
    return payload;
  } catch {
    return data;
  }
}

/**
 * Deletes the cache file for a university.
 */
function clearCache(universityId) {
  if (!CACHE_WRITABLE) return;
  const file = cacheFile(universityId);
  if (fs.existsSync(file)) fs.unlinkSync(file);
}

/**
 * Returns cache status for all known universities.
 */
function cacheStatus(universityIds) {
  return universityIds.reduce((acc, id) => {
    const file = cacheFile(id);
    if (!fs.existsSync(file)) { acc[id] = { cached: false }; return acc; }
    try {
      const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
      const scraped = new Date(raw.scraped_at);
      const ageMs = Date.now() - scraped.getTime();
      const valid = ageMs < TTL_HOURS * 3600 * 1000;
      acc[id] = { cached: true, valid, scraped_at: raw.scraped_at, source: raw.source };
    } catch {
      acc[id] = { cached: false };
    }
    return acc;
  }, {});
}

module.exports = { getCache, setCache, clearCache, cacheStatus };
