'use strict';
const { scrapeWithPlaywright, scrapeWithCheerio } = require('../strategies/official');

module.exports = {
  officialUrls: {
    daya_tampung: 'https://smup.unpad.ac.id/daya-tampung/',
    passing_grade: null,
  },
  affiliatedUrls: {
    zenius: 'https://zenius.net/blog/passing-grade-unpad',
    snpmb:  'https://snpmb.bppp.kemdikbud.go.id',
  },

  async scrapeOfficial() {
    const url = this.officialUrls.daya_tampung;
    try {
      return await scrapeWithCheerio(url, ($) => {
        const programs = [];
        $('table tbody tr').each((_, row) => {
          const cells = $(row).find('td');
          if (cells.length < 3) return;
          const program = $(cells[0]).text().trim() || $(cells[1]).text().trim();
          const quota   = parseInt($(cells[cells.length - 2]).text().replace(/\D/g,''), 10);
          const apps    = parseInt($(cells[cells.length - 1]).text().replace(/\D/g,''), 10);
          if (!program || !quota) return;
          programs.push({ program, faculty: 'Unknown', quota_mandiri: quota, applicants_mandiri: apps || quota * 15, source_type: 'official' });
        });
        return programs;
      });
    } catch (_) {}

    try {
      return await scrapeWithPlaywright(url, async (page) => {
        await page.waitForSelector('table', { timeout: 15000 }).catch(() => {});
        return page.evaluate(() => {
          const rows = Array.from(document.querySelectorAll('table tbody tr'));
          return rows.map(r => {
            const cells = Array.from(r.querySelectorAll('td')).map(c => c.innerText.trim());
            return { program: cells[0], faculty: 'Unknown', quota_mandiri: parseInt(cells[1]) || 0, source_type: 'official' };
          }).filter(p => p.program);
        });
      });
    } catch (err) {
      console.warn('[unpad] official scrape failed:', err.message);
      return [];
    }
  },

  async scrapeAffiliated() {
    const { scrapeAffiliated } = require('../strategies/affiliated');
    return scrapeAffiliated('unpad');
  },
};
