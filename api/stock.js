// api/stock.js
// 升级版：不仅快，而且数据全 (包含回撤、周涨跌)

export default async function handler(req, res) {
  // CORS 设置保持不变
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const { symbol } = req.query;
  if (!symbol) { return res.status(400).json({ error: 'Missing symbol' }); }

  try {
    // 请求 5 天的数据，用于计算周涨幅
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=5d`
    );
    const data = await response.json();

    if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
      throw new Error('No data found');
    }

    const result = data.chart.result[0];
    const quote = result.meta;
    const timestamps = result.timestamp || [];
    const closes = result.indicators.quote[0].close || [];

    // 1. 获取核心价格
    const currentPrice = quote.regularMarketPrice;
    const previousClose = quote.chartPreviousClose;
    
    // 2. 计算日涨跌 (Day Change)
    const dayChangePercent = ((currentPrice - previousClose) / previousClose) * 100;

    // 3. 计算 52周回撤 (Drawdown) - 这决定了“冷/热”标签
    // 逻辑：(当前价 - 52周最高价) / 52周最高价
    const high52 = quote.fiftyTwoWeekHigh;
    const drawdown = high52 ? ((currentPrice - high52) / high52) * 100 : 0;

    // 4. 计算周涨跌 (Week Change) - 取5天前的数据
    let weekChangePercent = 0;
    if (closes.length > 0) {
        const weekStartPrice = closes[0]; // 5天前收盘价
        if (weekStartPrice) {
            weekChangePercent = ((currentPrice - weekStartPrice) / weekStartPrice) * 100;
        }
    }

    res.status(200).json({
      symbol: symbol,
      price: currentPrice,
      changePercent: dayChangePercent, // 日涨跌
      weekChangePercent: weekChangePercent, // 周涨跌 (找回了这个!)
      drawdown: drawdown, // 回撤 (找回了这个!)
      high52: high52,
      currency: quote.currency,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Fetch failed', symbol });
  }
}
