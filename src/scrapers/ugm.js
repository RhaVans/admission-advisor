'use strict';
const { scrapeWithPlaywright, scrapeWithCheerio } = require('../strategies/official');

module.exports = {
  officialUrls: {
    daya_tampung: 'https://um.ugm.ac.id/daya-tampung-jalur-mandiri/',
    passing_grade: null,
  },
  affiliatedUrls: {
    zenius: 'https://zenius.net/blog/passing-grade-ugm',
    snpmb:  'https://snpmb.bppp.kemdikbud.go.id',
  },

  /**
   * Attempts to scrape UGM official admissions page.
   * UGM uses a WordPress site — try Cheerio first, Playwright as fallback.
   */
  async scrapeOfficial() {
    const url = this.officialUrls.daya_tampung;

    // Try Cheerio (static render)
    try {
      return await scrapeWithCheerio(url, ($) => {
        const programs = [];
        $('table tbody tr').each((_, row) => {
          const cells = $(row).find('td');
          if (cells.length < 4) return;
          const program  = $(cells[0]).text().trim() || $(cells[1]).text().trim();
          const faculty  = $(cells[0]).text().trim();
          const quota    = parseInt($(cells[cells.length - 2]).text().replace(/\D/g,''), 10);
          const apps     = parseInt($(cells[cells.length - 1]).text().replace(/\D/g,''), 10);
          if (!program || !quota) return;
          programs.push({ program, faculty, quota_mandiri: quota, applicants_mandiri: apps || quota * 15, source_type: 'official' });
        });
        return programs;
      });
    } catch (_) {}

    // Playwright fallback
    return scrapeWithPlaywright(url, async (page) => {
      return page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('table tbody tr'));
        return rows.map(r => {
          const cells = Array.from(r.querySelectorAll('td')).map(c => c.innerText.trim());
          return { program: cells[0], faculty: cells[1], quota_mandiri: parseInt(cells[2]) || 30, source_type: 'official' };
        }).filter(p => p.program);
      });
    });
  },

  async scrapeAffiliated() {
    const { scrapeAffiliated } = require('../strategies/affiliated');
    return scrapeAffiliated('ugm');
  },
};
