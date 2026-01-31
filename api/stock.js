// api/stock.js
// 完美适配版：计算日、周、月、回撤，字段完全对齐

export default async function handler(req, res) {
  // 1. CORS 设置 (允许跨域)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const { symbol } = req.query;
  if (!symbol) return res.status(400).json({ error: 'Missing symbol' });

  try {
    // 关键修改：请求 3个月 (3mo) 数据，这样才能算出“月涨跌”
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=3mo`
    );
    const data = await response.json();

    if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
      throw new Error('No data found');
    }

    const result = data.chart.result[0];
    const quote = result.meta;
    const closes = result.indicators.quote[0].close || [];

    // --- 核心计算逻辑 ---
    
    // 1. 当前价格 & 52周高点
    const currentPrice = quote.regularMarketPrice || closes[closes.length - 1];
    const high52 = quote.fiftyTwoWeekHigh || currentPrice; // 如果API没返回，就暂用当前价防止报错

    // 2. 日涨跌 (Day) - 优先用 API 给的准确收盘价
    const dayChange = ((currentPrice - quote.chartPreviousClose) / quote.chartPreviousClose) * 100;

    // 3. 周涨跌 (Week) - 找 5 个交易日前的价格
    let weekChange = 0;
    if (closes.length >= 6) {
        const price5dAgo = closes[closes.length - 6]; // -1是今天, -6是5天前
        if (price5dAgo) weekChange = ((currentPrice - price5dAgo) / price5dAgo) * 100;
    }

    // 4. 月涨跌 (Month) - 找 21 个交易日前的价格 (约1个月)
    let monthChange = 0;
    if (closes.length >= 22) {
        const priceMonthAgo = closes[closes.length - 22]; 
        if (priceMonthAgo) monthChange = ((currentPrice - priceMonthAgo) / priceMonthAgo) * 100;
    }

    // 5. 回撤 (Drawdown)
    const drawdown = ((currentPrice - high52) / high52) * 100;

    // --- 返回给前端 (字段名必须标准) ---
    res.status(200).json({
      symbol: symbol,
      price: currentPrice,
      dayChange: dayChange,       // 对应前端 "日"
      weekChange: weekChange,     // 对应前端 "周"
      monthChange: monthChange,   // 对应前端 "月"
      drawdown: drawdown,         // 对应前端 "回撤"
      high52: high52
    });

  } catch (error) {
    console.error(`Error fetching ${symbol}:`, error);
    // 报错时返回空结构，防止前端白屏
    res.status(500).json({ error: 'Failed', symbol });
  }
}
