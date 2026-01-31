import { useState, useEffect, useCallback } from 'react';

// === 数据获取 Hook (保持之前的修复版不动) ===
export const useStockData = (symbols) => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!symbols || symbols.length === 0) {
      setLoading(false);
      return;
    }
    
    // 首次加载显示loading，后续静默刷新
    if (Object.keys(data).length === 0) setLoading(true);
    setError(null);
    
    try {
      const newData = {};
      const promises = symbols.map(async (symbol) => {
        try {
          const res = await fetch(`/api/stock?symbol=${symbol}`);
          const json = await res.json();
          if (json.error) return;
          newData[symbol] = json;
        } catch (e) {
          console.error(`Fetch error for ${symbol}`, e);
        }
      });

      await Promise.all(promises);
      setData(prev => ({ ...prev, ...newData }));
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(symbols)]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30 * 1000);
    return () => clearInterval(interval);
  }, [refresh]);

  return { data, loading, error, refresh };
};

// === 预设的“豪华演示”股票池 ===
const DEFAULT_STOCKS = {
  // 1. 货币/避险: 你的核心关注 (BTC/MSTR) + 传统避险
  monetary: [
    'MSTR', 'COIN', 'GBTC', 'IBIT',  // 币圈核心
    'TLT', 'IEF', 'SHY',             // 美债三兄弟
    'JPM', 'BAC', 'GS', 'MS',        // 银行巨头
    'BLK', 'V', 'MA', 'PYPL'         // 金融基建
  ],
  // 2. 贵金属: 黄金白银矿企
  precious: [
    'NEM', 'GOLD', 'AEM', 'FNV', 'WPM', // 黄金巨头
    'PAAS', 'HL', 'AG', 'CDE',          // 白银与小矿
    'KGC', 'AU', 'GFI', 'IAG', 'NG', 'SIL'
  ],
  // 3. 工业金属: 铜铝锂 (AI与电力的基础)
  industrial: [
    'FCX', 'SCCO', 'TECK',              // 铜三巨头
    'VALE', 'RIO', 'BHP',               // 综合矿业
    'AA', 'CENX',                       // 铝
    'ALB', 'SQM', 'LTHM',               // 锂 (新能源)
    'X', 'NUE', 'STLD', 'CLF'           // 钢铁
  ],
  // 4. 能源: 石油天然气
  energy: [
    'XOM', 'CVX', 'COP',                // 美国石油三巨头
    'SHELL', 'TTE', 'BP',               // 欧洲巨头
    'OXY', 'EOG', 'PXD', 'DVN',         // 页岩油/巴菲特概念
    'SLB', 'HAL', 'BKR',                // 油服
    'MPC', 'PSX'                        // 炼化
  ],
  // 5. 农业: 粮食安全
  agriculture: [
    'DE', 'CAT', 'AGCO',                // 农机
    'ADM', 'BG',                        // 四大粮商
    'NTR', 'MOS', 'CF', 'ICL',          // 化肥
    'TSN', 'GIS', 'K', 'CAG', 'SJM',    // 食品加工
    'FDP'
  ]
};

// === 用户股票池 Hook (修改了初始化逻辑) ===
export const useWatchlist = () => {
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const saved = localStorage.getItem('cycle-radar-watchlist');
      // 关键修改：如果本地没有存过(或者原本是空的)，就载入上面的 DEFAULT_STOCKS
      // 这样演示的时候一打开就是满的
      if (saved) {
        const parsed = JSON.parse(saved);
        // 简单检查一下是否为空对象，如果是空的，也给默认值
        const isEmpty = Object.values(parsed).every(arr => arr.length === 0);
        return isEmpty ? DEFAULT_STOCKS : parsed;
      }
      return DEFAULT_STOCKS;
    } catch {
      return DEFAULT_STOCKS;
    }
  });

  useEffect(() => {
    localStorage.setItem('cycle-radar-watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  const addStock = useCallback((sectorId, symbol) => {
    const upperSymbol = symbol.toUpperCase().trim();
    if (!upperSymbol) return false;
    
    setWatchlist(prev => {
      if (prev[sectorId]?.includes(upperSymbol)) {
        return prev;
      }
      return {
        ...prev,
        [sectorId]: [...(prev[sectorId] || []), upperSymbol]
      };
    });
    return true;
  }, []);

  const removeStock = useCallback((sectorId, symbol) => {
    setWatchlist(prev => ({
      ...prev,
      [sectorId]: prev[sectorId]?.filter(s => s !== symbol) || []
    }));
  }, []);

  const getStocksForSector = useCallback((sectorId) => {
    return watchlist[sectorId] || [];
  }, [watchlist]);

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
