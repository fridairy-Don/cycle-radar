// api/detail.js
// V8.0 使用和 stock.js 一样的 v8 chart API (最稳定)

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
    // 2. 使用 v8 chart API (和 stock.js 一样)
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1y`
    );
    const data = await response.json();

    if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
      throw new Error('No data found');
    }

    const result = data.chart.result[0];
    const meta = result.meta;
    const quotes = result.indicators.quote[0];
    const closes = quotes.close.filter(c => c !== null);

    // 计算关键数据
    const currentPrice = meta.regularMarketPrice || closes[closes.length - 1];
    const prevClose = closes[closes.length - 2] || currentPrice;
    const dayChange = currentPrice - prevClose;
    const dayChangePercent = (dayChange / prevClose) * 100;

    // 52周数据
    const high52 = meta.fiftyTwoWeekHigh || Math.max(...closes);
    const low52 = meta.fiftyTwoWeekLow || Math.min(...closes);
    const drawdown = ((currentPrice - high52) / high52) * 100;

    // 3. 组装数据
    const cleanData = {
      symbol: symbol,
      name: meta.shortName || meta.longName || symbol,
      description: `${meta.shortName || symbol} - ${meta.exchangeName || '交易所'} · ${meta.instrumentType || '证券'}`,
      sector: meta.instrumentType || 'ETF/基金',
      industry: meta.exchangeName || '—',

      // 价格
      currentPrice: currentPrice?.toFixed(2) || '—',
      currency: meta.currency === 'USD' ? '$' : (meta.currency || '$'),

      // 核心指标
      marketCap: '—', // v8 API 不返回市值
      peRatio: '—',   // v8 API 不返回 PE
      dividendYield: '—',
      high52: high52?.toFixed(2) || '—',
      low52: low52?.toFixed(2) || '—',

      // 涨跌
      dayChange: dayChange?.toFixed(2) || '—',
      dayChangePercent: dayChangePercent?.toFixed(2) + '%' || '—',
      drawdown: drawdown?.toFixed(2) + '%' || '—'
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
