import cloudscraper from 'cloudscraper';

/* ---------- 单例 ---------- */
let scraper = null;
function getScraper () {
  if (scraper) return scraper;

  /* v4.5+ 有 createScraper；老版 / 移除则用 defaults */
  if (typeof cloudscraper.createScraper === 'function') {
    scraper = cloudscraper.createScraper({
      browser: { browser: 'chrome', platform: 'windows', desktop: true }
    });
  } else if (typeof cloudscraper.defaults === 'function') {
    scraper = cloudscraper.defaults({
      browser: { browser: 'chrome', platform: 'windows', desktop: true }
    });
  } else {
    // 最保底：直接用原函数（每次新挑战，不复用 cookie）
    scraper = cloudscraper;
  }
  return scraper;
}

/* ---------- API 入口 ---------- */
export default async function handler (req, res) {
  const { address } = req.query;
  if (!address) return res.status(400).json({ error: 'missing address' });

  const url = `https://loyalty.campnetwork.xyz/api/users?walletAddress=${address}`;

  try {
    const raw  = await getScraper().get(url, { timeout: 15000 });
    const json = JSON.parse(raw);
    res.status(200).json(json);
  } catch (err) {
    /* Cookie 失效或 CF 阻挡：下次重新生成实例 */
    scraper = null;
    res.status(502).json({ error: 'upstream failed', detail: err.message });
  }
}
