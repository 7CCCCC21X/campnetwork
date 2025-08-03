import cloudscraper from 'cloudscraper';

/* 单例：cold-start 创建，后续复用同一 cf_clearance */
let scraper = null;
function getScraper () {
  if (scraper) return scraper;
  scraper = cloudscraper.createScraper({
    browser: { browser: 'chrome', platform: 'windows', desktop: true }
  });
  return scraper;
}

export default async function handler (req, res) {
  const { address } = req.query;
  if (!address) return res.status(400).json({ error: 'missing address' });

  const url = `https://loyalty.campnetwork.xyz/api/users?walletAddress=${address}`;

  try {
    const raw  = await getScraper().get(url, { timeout: 15000 });
    const json = JSON.parse(raw);
    res.status(200).json(json);
  } catch (err) {
    scraper = null;                       // 失效时重建
    res.status(502).json({ error: 'upstream failed', detail: err.message });
  }
}
