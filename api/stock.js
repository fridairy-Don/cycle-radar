// api/stock.js
// 这是一个运行在 Vercel 边缘节点的服务器脚本
// 专门负责帮国内用户“代购” Yahoo 的数据

export default async function handler(req, res) {
  // 设置 CORS 允许任何网站访问 (解决跨域问题)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { symbol } = req.query;

  if (!symbol) {
    return res.status(400).json({ error: 'Missing symbol' });
  }

  try {
    // Vercel 服务器在美国，访问 Yahoo 速度极快
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=5d`
    );
    const data = await response.json();

    if (!data.chart || !data.chart.result) {
      throw new Error('No data found');
    }

    const result = data.chart.result[0];
    const quote = result.meta;
    const currentPrice = quote.regularMarketPrice;
    const previousClose = quote.chartPreviousClose;
    const changePercent = ((currentPrice - previousClose) / previousClose) * 100;

    // 只返回前端需要的核心数据，减少流量
    res.status(200).json({
      symbol: symbol,
      price: currentPrice,
      changePercent: changePercent,
      currency: quote.currency,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error(error);
    // 失败时返回 0，保证前端不崩
    res.status(500).json({ 
        symbol: symbol, 
        price: 0, 
        changePercent: 0, 
        error: 'Fetch failed' 
    });
  }
}
