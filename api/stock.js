// api/stock.js
// 修复版 V5：精准计算涨跌幅 (修复日涨跌过大的 Bug)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const { symbol } = req.query;
  if (!symbol) return res.status(400).json({ error: 'Missing symbol' });

  try {
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
    const closes = quotes.close;

    // 1. 找到最近的两个有效收盘价 (倒序查找)
    // 雅虎有时会返回 null，必须过滤
    const validPrices = [];
    for(let i = closes.length - 1; i >= 0; i--) {
        if (closes[i] !== null && closes[i] !== undefined) {
            validPrices.unshift(closes[i]); // 保持时间顺序塞入
        }
        // 我们只需要最后 30 个数据就够算月涨跌了，不用全部存，节省内存
        if (validPrices.length > 30) break; 
    }

    if (validPrices.length < 2) throw new Error('Not enough price data');

    // === 精准计算 ===
    const len = validPrices.length;
    const currentPrice = validPrices[len - 1]; // 最新价
    const prevClose = validPrices[len - 2];    // 昨天收盘价 (这才是对的!)

    // 日涨跌
    const dayChange = currentPrice - prevClose;
    const dayChangePercent = (dayChange / prevClose) * 100;

    // 周涨跌 (往前找5天)
    const price5dAgo = validPrices[len - 6] || validPrices[0];
    const weekChangePercent = ((currentPrice - price5dAgo) / price5dAgo) * 100;

    // 月涨跌 (往前找22天)
    const priceMonthAgo = validPrices[len - 22] || validPrices[0];
    const monthChangePercent = ((currentPrice - priceMonthAgo) / priceMonthAgo) * 100;

    // 52周回撤
    const high52 = meta.fiftyTwoWeekHigh || Math.max(...validPrices);
    const drawdown = ((currentPrice - high52) / high52) * 100;

    res.status(200).json({
      symbol,
      price: currentPrice,
      dayChange,
      dayChangePercent,
      weekChangePercent,
      monthChangePercent,
      high52Week: high52,
      drawdown,
      currency: meta.currency,
      shortName: meta.shortName, // 传回雅虎的英文名
      lastUpdated: Date.now()
    });

  } catch (error) {
    console.error(`Error ${symbol}:`, error);
    res.status(500).json({ error: 'Fetch failed', symbol });
  }
}
