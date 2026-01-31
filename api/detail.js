// api/detail.js
// V4.0 核弹级修复：使用 yahoo-finance2 库进行正规调用
// 自动处理 Crumb 和 Cookie，解决“数据加载受限”问题

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
    // 2. 抑制控制台警告 (库的一个小癖好)
    yahooFinance.suppressNotices(['yahooSurvey']);

    // 3. 使用库请求 quoteSummary (包含简介、价格、核心指标)
    // 这个库会自动处理反爬验证
    const result = await yahooFinance.quoteSummary(symbol, {
      modules: ['price', 'summaryProfile', 'summaryDetail', 'defaultKeyStatistics', 'assetProfile']
    });

    if (!result) throw new Error('No data returned');

    // 4. 智能提取 (兼容 公司 vs ETF)
    const price = result.price || {};
    const profile = result.summaryProfile || result.assetProfile || {};
    const detail = result.summaryDetail || {};
    const stats = result.defaultKeyStatistics || {};

    // 5. 组装数据 (空值保护)
    const cleanData = {
      symbol: symbol,
      name: price.shortName || price.longName || symbol,
      // 如果没有简介，显示友好提示
      description: profile.longBusinessSummary || '暂无详细简介',
      sector: profile.sector || 'ETF/基金',
      industry: profile.industry || '投资工具',
      
      // 价格
      currentPrice: price.regularMarketPrice ? price.regularMarketPrice.toFixed(2) : '—',
      currency: price.currencySymbol || '$',
      
      // 核心指标 (库返回的是原始数字，我们需要手动加单位)
      // 使用 helper 函数格式化大数字
      marketCap: formatNumber(price.marketCap || detail.totalAssets),
      peRatio: detail.trailingPE ? detail.trailingPE.toFixed(2) : '—',
      dividendYield: detail.dividendYield ? (detail.dividendYield * 100).toFixed(2) + '%' : (detail.yield ? (detail.yield * 100).toFixed(2) + '%' : '—'),
      high52: detail.fiftyTwoWeekHigh ? detail.fiftyTwoWeekHigh.toFixed(2) : '—',
      low52: detail.fiftyTwoWeekLow ? detail.fiftyTwoWeekLow.toFixed(2) : '—'
    };

    res.status(200).json(cleanData);

  } catch (error) {
    console.error(`Detail fetch failed for ${symbol}:`, error);
    res.status(200).json({
      symbol: symbol,
      name: symbol,
      // 这里的错误信息会显示在弹窗里
      description: "数据源暂时拥堵，请稍后再试。", 
      currentPrice: "—",
      error: true
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
