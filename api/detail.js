// api/detail.js
// 专门用于获取单只股票的深度详情 (公司简介、市值、PE等)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const { symbol } = req.query;
  if (!symbol) return res.status(400).json({ error: 'Missing symbol' });

  try {
    // 请求 Yahoo 的 quoteSummary 模块，获取简介和核心数据
    const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=summaryProfile,summaryDetail,price,defaultKeyStatistics`;
    
    const response = await fetch(url);
    const data = await response.json();
    const result = data.quoteSummary?.result?.[0];

    if (!result) throw new Error('No data');

    // 提取核心数据
    const profile = result.summaryProfile || {};
    const stats = result.defaultKeyStatistics || {};
    const detail = result.summaryDetail || {};
    const price = result.price || {};

    const cleanData = {
      symbol: symbol,
      name: price.shortName || symbol,
      description: profile.longBusinessSummary || '暂无简介',
      sector: profile.sector || '未知板块',
      industry: profile.industry || '未知行业',
      website: profile.website,
      // 核心财务指标
      marketCap: price.marketCap?.fmt || '—',
      peRatio: detail.trailingPE?.fmt || '—', // 市盈率
      eps: stats.trailingEps?.fmt || '—', // 每股收益
      dividendYield: detail.dividendYield?.fmt || '—', // 股息率
      high52: detail.fiftyTwoWeekHigh?.fmt || '—',
      low52: detail.fiftyTwoWeekLow?.fmt || '—',
      // 价格
      currentPrice: price.regularMarketPrice?.fmt || '—',
      currency: price.currencySymbol || '$'
    };

    res.status(200).json(cleanData);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Detail fetch failed' });
  }
}
