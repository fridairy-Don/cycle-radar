// api/stock.js
// 修复版：严格对齐 Claude 原版 UI 需求
// 包含：日涨跌、周涨跌、月涨跌、52周回撤、热度数据

export default async function handler(req, res) {
  // 1. CORS 允许跨域 (国内访问必须)
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
    // 关键修正：请求 3个月 (3mo) 数据，确保能算出“月涨跌”
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

    // --- 核心计算 (服务端算好，减轻前端负担) ---
    
    // 1. 获取价格 (优先用收盘价序列，防止 meta 数据延迟)
    // 过滤掉 null 值 (Yahoo 有时会返回 null)
    const validCloses = closes.filter(c => c !== null);
    const currentPrice = validCloses[validCloses.length - 1];
    const prevClose = validCloses[validCloses.length - 2];

    // 2. 52周数据 (用于计算热度/回撤)
    const high52 = quote.fiftyTwoWeekHigh || Math.max(...validCloses);
    const low52 = quote.fiftyTwoWeekLow || Math.min(...validCloses);

    // 3. 计算涨跌幅
    // 日涨跌
    const dayChange = ((currentPrice - prevClose) / prevClose); // 小数格式，前端会转百分比

    // 周涨跌 (往前找 5 个交易日)
    let weekChange = 0;
    if (validCloses.length >= 6) {
        const price5dAgo = validCloses[validCloses.length - 6];
        weekChange = ((currentPrice - price5dAgo) / price5dAgo);
    }

    // 月涨跌 (往前找 21 个交易日)
    let monthChange = 0;
    if (validCloses.length >= 22) {
        const priceMonthAgo = validCloses[validCloses.length - 22];
        monthChange = ((currentPrice - priceMonthAgo) / priceMonthAgo);
    }

    // 回撤 (Drawdown)
    const drawdown = high52 ? ((currentPrice - high52) / high52) : 0;

    // --- 返回完整数据包 ---
    res.status(200).json({
      symbol: symbol,
      price: currentPrice,
      dayChange: dayChange,     // 日
      weekChange: weekChange,   // 周
      monthChange: monthChange, // 月
      drawdown: drawdown,       // 回撤
      high52: high52,
      low52: low52,
      currency: quote.currency
    });

  } catch (error) {
    console.error(`Error fetching ${symbol}:`, error);
    res.status(500).json({ error: 'Fetch failed', symbol });
  }
}
