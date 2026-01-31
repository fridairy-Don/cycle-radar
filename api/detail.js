// api/detail.js
// V3.6 终极修复版：增加浏览器伪装 (User-Agent) 防止 Yahoo 拦截

export default async function handler(req, res) {
  // 1. 允许跨域
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const { symbol } = req.query;
  if (!symbol) return res.status(400).json({ error: 'Missing symbol' });

  try {
    // 2. 构造请求 URL (一次性请求所有可能用到的模块)
    const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=price,summaryDetail,summaryProfile,assetProfile,defaultKeyStatistics`;
    
    // 3. 【关键修复】伪装成浏览器，防止 Yahoo 拦截 (403 Forbidden)
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    });

    if (!response.ok) {
      throw new Error(`Yahoo API rejected: ${response.status}`);
    }

    const data = await response.json();
    const result = data.quoteSummary?.result?.[0];

    if (!result) throw new Error('No data found structure');

    // 4. 智能提取 (兼容 股票 vs ETF)
    
    // 简介：股票在 summaryProfile，ETF 在 assetProfile
    const profile = result.summaryProfile || result.assetProfile || {};
    const description = profile.longBusinessSummary || '暂无详细介绍';
    const sector = profile.sector || 'ETF/基金';
    
    // 价格 & 细节
    const price = result.price || {};
    const detail = result.summaryDetail || {};
    const stats = result.defaultKeyStatistics || {};

    // 5. 组装数据 (所有字段加空值保护)
    const cleanData = {
      symbol: symbol,
      name: price.shortName || price.longName || symbol,
      description: description,
      sector: sector,
      industry: profile.industry || '投资工具',
      
      // 价格
      currentPrice: price.regularMarketPrice?.fmt || '—',
      currency: price.currencySymbol || '$',
      
      // 核心指标 (优先取 format 后的值)
      marketCap: price.marketCap?.fmt || detail.totalAssets?.fmt || '—', // 股票看市值，ETF看净资产
      peRatio: detail.trailingPE?.fmt || '—',
      eps: stats.trailingEps?.fmt || '—',
      dividendYield: detail.dividendYield?.fmt || detail.yield?.fmt || '—',
      high52: detail.fiftyTwoWeekHigh?.fmt || '—',
      low52: detail.fiftyTwoWeekLow?.fmt || '—'
    };

    res.status(200).json(cleanData);

  } catch (error) {
    console.error(`Detail fetch error for ${symbol}:`, error);
    
    // 6. 降级方案：如果详情 API 彻底失败，返回一个只有名字的“空卡片”，不要让前端崩掉
    res.status(200).json({
      symbol: symbol,
      name: symbol,
      description: "数据加载受限 (Yahoo API)，请稍后重试或直接访问 Yahoo Finance。",
      sector: "未知",
      currentPrice: "—",
      marketCap: "—",
      error: false // 标记为非致命错误，让弹窗能显示出来
    });
  }
}
