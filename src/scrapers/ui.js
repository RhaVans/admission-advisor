'use strict';
const { scrapeWithPlaywright, scrapeWithCheerio } = require('../strategies/official');

module.exports = {
  officialUrls: {
    daya_tampung: 'https://penerimaan.ui.ac.id/simak-ui/daya-tampung',
    passing_grade: null,
  },
  affiliatedUrls: {
    zenius: 'https://zenius.net/blog/passing-grade-ui',
    snpmb:  'https://snpmb.bppp.kemdikbud.go.id',
  },

  async scrapeOfficial() {
    const url = this.officialUrls.daya_tampung;
    try {
      return await scrapeWithPlaywright(url, async (page) => {
        await page.waitForSelector('table', { timeout: 15000 }).catch(() => {});
        return page.evaluate(() => {
          const rows = Array.from(document.querySelectorAll('table tbody tr'));
          return rows.map(r => {
            const cells = Array.from(r.querySelectorAll('td')).map(c => c.innerText.trim());
            return {
              program:             cells[1] || cells[0],
              faculty:             cells[0],
              quota_mandiri:       parseInt(cells[2]) || 0,
              applicants_mandiri:  parseInt(cells[3]) || 0,
              source_type:         'official',
            };
          }).filter(p => p.program && p.quota_mandiri > 0);
        });
      });
    } catch (err) {
      console.warn('[ui] official scrape failed:', err.message);
      return [];
    }
  },

  async scrapeAffiliated() {
    const { scrapeAffiliated } = require('../strategies/affiliated');
    return scrapeAffiliated('ui');
  },
};
