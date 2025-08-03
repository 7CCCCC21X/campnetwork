import cloudscraper from 'cloudscraper';

/** 单例：cold-start 时生成，后续复用 cf_clearance */
let scraper = null;
function getScraper () {
  if (scraper) return scraper;
  scraper = cloudscraper.create_scraper // ← 注意：新版写法 create_scraper
    ? cloudscraper.create_scraper()
    : cloudscraper.createScraper({
        browser: { browser: 'chrome', platform: 'windows', desktop: true }
      });
  return scraper;
}

export default async function handler (req, res) {
  const { address } = req.query;
  if (!address) return res.status(400).json({ error: 'missing address' });

  const url = `https://loyalty.campnetwork.xyz/api/users?walletAddress=${address}`;

  try {
    const raw = await getScraper().get(url, { timeout: 15000 });
    const json = JSON.parse(raw);
    res.status(200).json(json);
  } catch (err) {
    // Cookie 失效或 CF 阻挡时重置实例
    scraper = null;
    res.status(502).json({ error: 'upstream failed', detail: err.message });
  }
}
