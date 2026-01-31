import { useState, useEffect, useCallback } from 'react';

// CORS代理列表（按优先级）
const CORS_PROXIES = [
  '', // 直接请求（如果同源或服务端支持）
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
];

// Yahoo Finance API
const YAHOO_API_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart/';

// 带重试的fetch
const fetchWithRetry = async (url, retries = 2) => {
  for (let proxyIndex = 0; proxyIndex < CORS_PROXIES.length; proxyIndex++) {
    const proxy = CORS_PROXIES[proxyIndex];
    const fullUrl = proxy ? `${proxy}${encodeURIComponent(url)}` : url;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(fullUrl, {
          headers: {
            'Accept': 'application/json',
          }
        });
        
        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        console.warn(`Attempt ${attempt + 1} with proxy ${proxyIndex} failed:`, error.message);
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
        }
      }
    }
  }
  throw new Error('All fetch attempts failed');
};

// 获取单个股票数据
const fetchStockData = async (symbol) => {
  try {
    const url = `${YAHOO_API_BASE}${symbol}?interval=1d&range=1y`;
    const data = await fetchWithRetry(url);
    
    const result = data.chart?.result?.[0];
    
    if (!result) {
      throw new Error(`No data for ${symbol}`);
    }
    
    const meta = result.meta;
    const quotes = result.indicators?.quote?.[0];
    const timestamps = result.timestamp;
    
    if (!quotes || !timestamps || timestamps.length === 0) {
      throw new Error(`Invalid data for ${symbol}`);
    }
    
    // 获取当前价格和相关数据
    const currentPrice = meta.regularMarketPrice;
    const previousClose = meta.chartPreviousClose || meta.previousClose;
    
    // 计算日涨跌幅
    const dayChange = currentPrice - previousClose;
    const dayChangePercent = (dayChange / previousClose) * 100;
    
    // 获取历史收盘价
    const closes = quotes.close.filter(c => c !== null);
    
    // 计算52周高点和回撤
    const high52Week = meta.fiftyTwoWeekHigh || Math.max(...closes);
    const drawdown = ((currentPrice - high52Week) / high52Week) * 100;
    
    // 计算周涨跌幅（5个交易日）
    const weekAgoPrice = closes.length >= 5 ? closes[closes.length - 5] : closes[0];
    const weekChangePercent = ((currentPrice - weekAgoPrice) / weekAgoPrice) * 100;
    
    // 计算月涨跌幅（约21个交易日）
    const monthAgoPrice = closes.length >= 21 ? closes[closes.length - 21] : closes[0];
    const monthChangePercent = ((currentPrice - monthAgoPrice) / monthAgoPrice) * 100;
    
    return {
      symbol,
      price: currentPrice,
      dayChange,
      dayChangePercent,
      weekChangePercent,
      monthChangePercent,
      high52Week,
      drawdown,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error fetching ${symbol}:`, error);
    return {
      symbol,
      price: null,
      dayChange: null,
      dayChangePercent: null,
      weekChangePercent: null,
      monthChangePercent: null,
      high52Week: null,
      drawdown: null,
      error: error.message,
      lastUpdated: new Date().toISOString()
    };
  }
};

// 批量获取股票数据
export const fetchMultipleStocks = async (symbols) => {
  const results = await Promise.all(symbols.map(fetchStockData));
  return results.reduce((acc, data) => {
    acc[data.symbol] = data;
    return acc;
  }, {});
};

// 自定义Hook：管理股票数据
export const useStockData = (symbols) => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!symbols || symbols.length === 0) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const stockData = await fetchMultipleStocks(symbols);
      setData(stockData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [symbols.join(',')]);

  useEffect(() => {
    refresh();
    
    // 每5分钟自动刷新
    const interval = setInterval(refresh, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refresh]);

  return { data, loading, error, refresh };
};

// 自定义Hook：管理用户股票池
export const useWatchlist = () => {
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const saved = localStorage.getItem('cycle-radar-watchlist');
      return saved ? JSON.parse(saved) : {
        monetary: [],
        precious: [],
        industrial: [],
        energy: [],
        agriculture: []
      };
    } catch {
      return {
        monetary: [],
        precious: [],
        industrial: [],
        energy: [],
        agriculture: []
      };
    }
  });

  // 保存到localStorage
  useEffect(() => {
    localStorage.setItem('cycle-radar-watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  // 添加股票到某个板块
  const addStock = useCallback((sectorId, symbol) => {
    const upperSymbol = symbol.toUpperCase().trim();
    if (!upperSymbol) return false;
    
    setWatchlist(prev => {
      if (prev[sectorId]?.includes(upperSymbol)) {
        return prev; // 已存在
      }
      return {
        ...prev,
        [sectorId]: [...(prev[sectorId] || []), upperSymbol]
      };
    });
    return true;
  }, []);

  // 从某个板块删除股票
  const removeStock = useCallback((sectorId, symbol) => {
    setWatchlist(prev => ({
      ...prev,
      [sectorId]: prev[sectorId]?.filter(s => s !== symbol) || []
    }));
  }, []);

  // 获取某个板块的股票列表
  const getStocksForSector = useCallback((sectorId) => {
    return watchlist[sectorId] || [];
  }, [watchlist]);

  // 获取所有股票（去重）
  const getAllStocks = useCallback(() => {
    const all = Object.values(watchlist).flat();
    return [...new Set(all)];
  }, [watchlist]);

  return {
    watchlist,
    addStock,
    removeStock,
    getStocksForSector,
    getAllStocks
  };
};

export default useStockData;
