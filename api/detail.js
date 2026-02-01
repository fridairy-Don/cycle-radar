// api/detail.js
// V7.0 直接调用 Yahoo Finance HTTP API (和 stock.js 一样稳定)

export default async function handler(req, res) {
  // 1. 跨域设置
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { symbol } = req.query;
  if (!symbol) return res.status(400).json({ error: 'Missing symbol' });

  try {
    // 2. 使用 quoteSummary API 获取详细信息
    const modules = 'price,summaryProfile,summaryDetail,assetProfile,defaultKeyStatistics';
    const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=${modules}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const data = await response.json();

    if (!data.quoteSummary || !data.quoteSummary.result || data.quoteSummary.result.length === 0) {
      throw new Error('No data found');
    }

    const result = data.quoteSummary.result[0];
    const price = result.price || {};
    const profile = result.summaryProfile || result.assetProfile || {};
    const detail = result.summaryDetail || {};
    const stats = result.defaultKeyStatistics || {};

    // 3. 提取价格 (处理雅虎的嵌套格式)
    const getVal = (obj) => obj?.raw ?? obj?.fmt ?? obj ?? null;

    // 4. 组装数据
    const cleanData = {
      symbol: symbol,
      name: price.shortName || price.longName || symbol,
      description: profile.longBusinessSummary || '暂无详细简介',
      sector: profile.sector || price.quoteType || 'ETF/基金',
      industry: profile.industry || '—',

      // 价格
      currentPrice: getVal(price.regularMarketPrice)?.toFixed?.(2) || getVal(price.regularMarketPrice) || '—',
      currency: price.currencySymbol || '$',

      // 核心指标
      marketCap: formatNumber(getVal(price.marketCap) || getVal(detail.totalAssets)),
      peRatio: getVal(detail.trailingPE)?.toFixed?.(2) || getVal(stats.trailingPE)?.toFixed?.(2) || '—',
      dividendYield: formatPercent(getVal(detail.dividendYield) || getVal(detail.yield)),
      high52: getVal(detail.fiftyTwoWeekHigh)?.toFixed?.(2) || '—',
      low52: getVal(detail.fiftyTwoWeekLow)?.toFixed?.(2) || '—',

      // 涨跌
      dayChange: getVal(price.regularMarketChange)?.toFixed?.(2) || '—',
      dayChangePercent: formatPercent(getVal(price.regularMarketChangePercent) / 100) || '—'
    };

    res.status(200).json(cleanData);

  } catch (error) {
    console.error(`Detail fetch failed for ${symbol}:`, error.message);

    res.status(200).json({
      symbol: symbol,
      name: symbol,
      description: `数据获取失败: ${error.message}`,
      currentPrice: '—',
      error: true,
      errorDetail: error.message
    });
  }
}

// 大数字格式化
function formatNumber(num) {
  if (!num) return '—';
  if (num > 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (num > 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num > 1e6) return (num / 1e6).toFixed(2) + 'M';
  return num.toLocaleString();
}

// 百分比格式化
function formatPercent(num) {
  if (!num && num !== 0) return '—';
  return (num * 100).toFixed(2) + '%';
}
