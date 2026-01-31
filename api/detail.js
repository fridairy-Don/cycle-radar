// api/detail.js
// V3.5 修复版：增强对 ETF 和非美股的兼容性，防止崩溃

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const { symbol } = req.query;
  if (!symbol) return res.status(400).json({ error: 'Missing symbol' });

  try {
    // 关键修复：ETF 通常没有 defaultKeyStatistics，所以我们要宽容处理
    const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=summaryProfile,summaryDetail,price,assetProfile`;
    
    const response = await fetch(url);
    const data = await response.json();
    const result = data.quoteSummary?.result?.[0];

    if (!result) throw new Error('No data found');

    // === 智能数据提取 (防崩溃) ===
    
    // 1. 简介：公司用 summaryProfile，ETF 用 assetProfile
    const profile = result.summaryProfile || result.assetProfile || {};
    const description = profile.longBusinessSummary || '暂无详细介绍';
    
    // 2. 价格与核心数据
    const price = result.price || {};
    const detail = result.summaryDetail || {};

    // 3. 构造返回数据 (所有字段都加了保险，没有就显示 —)
    const cleanData = {
      symbol: symbol,
      name: price.shortName || price.longName || symbol,
      description: description,
      sector: profile.sector || 'ETF/基金',
      industry: profile.industry || '投资工具',
      
      // 价格
      currentPrice: price.regularMarketPrice?.fmt || '—',
      currency: price.currencySymbol || '$',
      
      // 核心指标 (兼容 ETF)
      marketCap: price.marketCap?.fmt || detail.totalAssets?.fmt || '—', // 公司看市值，ETF看资产
      peRatio: detail.trailingPE?.fmt || '—',
      dividendYield: detail.dividendYield?.fmt || detail.yield?.fmt || '—',
      high52: detail.fiftyTwoWeekHigh?.fmt || '—',
      low52: detail.fiftyTwoWeekLow?.fmt || '—'
    };

    res.status(200).json(cleanData);

  } catch (error) {
    console.error(`Detail error for ${symbol}:`, error);
    // 即使失败，也返回一个能用的空架子，别让前端红屏
    res.status(200).json({
      symbol: symbol,
      name: symbol,
      description: "暂时无法获取该标的的详细数据，请稍后重试或访问 Yahoo Finance。",
      currentPrice: "—",
      error: true
    });
  }
}
