// api/stock.js
// 修复目标：完美复刻 Claude 前端的计算逻辑，但放在服务端执行以加速

export default async function handler(req, res) {
  // 1. 设置跨域，允许国内访问
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
    // 请求 3个月数据 (足够计算日、周、月涨跌)
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=3mo`
    );
    const data = await response.json();

    if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
      throw new Error('No data found');
    }

    const result = data.chart.result[0];
    const meta = result.meta;
    const quotes = result.indicators.quote[0];
    
    // 过滤掉无效数据 (null)
    const closes = quotes.close.filter(c => c !== null);

    if (closes.length === 0) throw new Error('No valid closes');

    // === 复刻 Claude 的核心算法 ===

    // 1. 当前价格 & 昨收
    const currentPrice = meta.regularMarketPrice || closes[closes.length - 1];
    const prevClose = meta.chartPreviousClose || meta.previousClose || closes[closes.length - 2];

    // 2. 日涨跌 (Day Change)
    const dayChange = currentPrice - prevClose;
    const dayChangePercent = ((dayChange / prevClose) * 100);

    // 3. 52周极值 & 回撤 (Drawdown)
    // 优先用 meta 数据，如果没有则用 3个月内的最高价代替 (误差极小)
    const high52Week = meta.fiftyTwoWeekHigh || Math.max(...closes);
    const drawdown = ((currentPrice - high52Week) / high52Week) * 100;

    // 4. 周涨跌 (5个交易日)
    let weekChangePercent = 0;
    if (closes.length >= 6) {
        const weekAgoPrice = closes[closes.length - 6];
        weekChangePercent = ((currentPrice - weekAgoPrice) / weekAgoPrice) * 100;
    }

    // 5. 月涨跌 (21个交易日)
    let monthChangePercent = 0;
    if (closes.length >= 22) {
        const monthAgoPrice = closes[closes.length - 22];
        monthChangePercent = ((currentPrice - monthAgoPrice) / monthAgoPrice) * 100;
    }

    // === 返回完全匹配前端 UI 的数据结构 ===
    res.status(200).json({
      symbol,
      price: currentPrice,
      dayChange,
      dayChangePercent,   // 关键字段：恢复红绿涨跌
      weekChangePercent,  // 关键字段：恢复二级菜单周数据
      monthChangePercent, // 关键字段：恢复二级菜单月数据
      high52Week,
      drawdown,           // 关键字段：恢复热度标签
      currency: meta.currency,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error(`Error fetching ${symbol}:`, error);
    res.status(500).json({ error: 'Fetch failed', symbol });
  }
}
