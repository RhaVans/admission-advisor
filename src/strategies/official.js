'use strict';
const axios = require('axios');
const cheerio = require('cheerio');
const { chromium } = require('playwright');

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
};

/**
 * Scrape a JS-rendered page with Playwright.
 * @param {string} url
 * @param {(page: import('playwright').Page) => Promise<any[]>} extractorFn
 * @returns {Promise<any[]>}
 */
async function scrapeWithPlaywright(url, extractorFn) {
  const headless = process.env.PLAYWRIGHT_HEADLESS !== 'false';
  const browser = await chromium.launch({ headless });
  const context = await browser.newContext({
    userAgent: BROWSER_HEADERS['User-Agent'],
    locale: 'id-ID',
  });
  const page = await context.newPage();
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    const data = await extractorFn(page);
    return data;
  } finally {
    await browser.close();
  }
}

/**
 * Scrape a static HTML page with Axios + Cheerio.
 * @param {string} url
 * @param {($: import('cheerio').CheerioAPI) => any[]} extractorFn
 * @returns {Promise<any[]>}
 */
async function scrapeWithCheerio(url, extractorFn) {
  const response = await axios.get(url, {
    headers: BROWSER_HEADERS,
    timeout: 20000,
    maxRedirects: 5,
  });
  const $ = cheerio.load(response.data);
  return extractorFn($);
}

module.exports = { scrapeWithPlaywright, scrapeWithCheerio };
