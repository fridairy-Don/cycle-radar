// api/detail.js
// V5.1 修复：简化 yahoo-finance2 调用

import yahooFinance from 'yahoo-finance2';

export default async function handler(req, res) {
  // 1. 跨域设置
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { symbol } = req.query;
  if (!symbol) return res.status(400).json({ error: 'Missing symbol' });

  try {
    // 2. 抑制控制台警告
    yahooFinance.suppressNotices(['yahooSurvey']);

    // 3. 使用 quote 获取基础数据 (更稳定)
    const quote = await yahooFinance.quote(symbol);

    // 4. 尝试获取详细信息 (可能失败，所以包在 try 里)
    let profile = {};
    let detail = {};
    try {
      const summary = await yahooFinance.quoteSummary(symbol, {
        modules: ['summaryProfile', 'summaryDetail', 'assetProfile']
      });
      profile = summary.summaryProfile || summary.assetProfile || {};
      detail = summary.summaryDetail || {};
    } catch (e) {
      console.log('quoteSummary failed, using quote data only');
    }

    if (!quote) throw new Error('No data returned');

    // 5. 组装数据 (优先使用 quote，detail 作为补充)
    const cleanData = {
      symbol: symbol,
      name: quote.shortName || quote.longName || symbol,
      description: profile.longBusinessSummary || '暂无详细简介',
      sector: profile.sector || quote.quoteType || 'ETF/基金',
      industry: profile.industry || '—',

      // 价格 (从 quote 获取，更稳定)
      currentPrice: quote.regularMarketPrice ? quote.regularMarketPrice.toFixed(2) : '—',
      currency: quote.currencySymbol || '$',

      // 核心指标
      marketCap: formatNumber(quote.marketCap || detail.totalAssets),
      peRatio: quote.trailingPE ? quote.trailingPE.toFixed(2) : (detail.trailingPE ? detail.trailingPE.toFixed(2) : '—'),
      dividendYield: quote.trailingAnnualDividendYield
        ? (quote.trailingAnnualDividendYield * 100).toFixed(2) + '%'
        : (detail.dividendYield ? (detail.dividendYield * 100).toFixed(2) + '%' : '—'),
      high52: quote.fiftyTwoWeekHigh ? quote.fiftyTwoWeekHigh.toFixed(2) : '—',
      low52: quote.fiftyTwoWeekLow ? quote.fiftyTwoWeekLow.toFixed(2) : '—',

      // 额外数据
      dayChange: quote.regularMarketChange ? quote.regularMarketChange.toFixed(2) : '—',
      dayChangePercent: quote.regularMarketChangePercent ? quote.regularMarketChangePercent.toFixed(2) + '%' : '—'
    };

    res.status(200).json(cleanData);

  } catch (error) {
    console.error(`Detail fetch failed for ${symbol}:`, error.message);

    // 返回更详细的错误信息用于调试
    res.status(200).json({
      symbol: symbol,
      name: symbol,
      description: `数据获取失败: ${error.message}`,
      currentPrice: "—",
      error: true,
      errorDetail: error.message
    });
  }
}

// 辅助：大数字格式化 (比如 1.2T, 50B)
function formatNumber(num) {
  if (!num) return '—';
  if (num > 1e12) return (num / 1e12).toFixed(2) + 'T'; // 万亿
  if (num > 1e9) return (num / 1e9).toFixed(2) + 'B';  // 十亿
  if (num > 1e6) return (num / 1e6).toFixed(2) + 'M';  // 百万
  return num.toLocaleString();
}
