import { useState, useEffect, useCallback } from 'react';

// === 1. 中文名称映射表 (只翻译核心的，其他的显示代码) ===
const NAME_MAP = {
  // 货币/避险
  'MSTR': '微策(比特币)', 'COIN': 'Coinbase', 'GBTC': '灰度BTC', 'IBIT': '贝莱德BTC',
  'TLT': '20年美债', 'IEF': '10年美债', 'SHY': '短期美债',
  'JPM': '摩根大通', 'BAC': '美国银行', 'GS': '高盛', 'V': 'Visa',
  'GLD': 'SPDR黄金', 'SLV': '白银ETF',
  // 工业
  'FCX': '自由港铜', 'SCCO': '南方铜业', 'TECK': '泰克资源', 'VALE': '淡水河谷',
  'BHP': '必和必拓', 'AA': '美国铝业', 'ALB': '雅保锂业', 'SQM': '智利矿业',
  'X': '美国钢铁', 'NUE': '纽克钢铁',
  // 能源
  'XOM': '埃克森美孚', 'CVX': '雪佛龙', 'COP': '康菲石油', 'SHELL': '壳牌',
  'OXY': '西方石油', 'SLB': '斯伦贝谢', 'USO': '原油ETF',
  // 农业
  'DE': '约翰迪尔', 'CAT': '卡特彼勒', 'ADM': 'ADM粮商', 'MOS': '美盛化肥',
  'DBA': '农产品ETF', 'MOO': '农业股ETF',
  // 科技
  'NVDA': '英伟达', 'MSFT': '微软', 'AAPL': '苹果', 'TSLA': '特斯拉', 'AMD': '超威'
};

// === 2. 强制刷新版本号 (改这个值，所有用户的缓存都会重置) ===
const STORAGE_VERSION = 'v2_demo_reset'; 

// === 3. 数据 Hook ===
export const useStockData = (symbols) => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!symbols || symbols.length === 0) {
      setLoading(false);
      return;
    }
    
    // 只有首次无数据时显示 loading
    if (Object.keys(data).length === 0) setLoading(true);
    
    try {
      const newData = {};
      const promises = symbols.map(async (symbol) => {
        try {
          const res = await fetch(`/api/stock?symbol=${symbol}`);
          const json = await res.json();
          if (json.error) return;
          
          // 注入中文名
          json.nameCN = NAME_MAP[symbol] || json.shortName || symbol;
          
          newData[symbol] = json;
        } catch (e) {
          console.error(e);
        }
      });
      await Promise.all(promises);
      setData(prev => ({ ...prev, ...newData }));
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(symbols)]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  return { data, loading, refresh };
};

// === 4. 默认股票池 ===
const DEFAULT_STOCKS = {
  monetary: ['MSTR', 'COIN', 'IBIT', 'TLT', 'JPM', 'GLD'],
  precious: ['NEM', 'GOLD', 'AEM', 'PAAS', 'AG', 'SLV'],
  industrial: ['FCX', 'SCCO', 'BHP', 'VALE', 'AA', 'ALB'],
  energy: ['XOM', 'CVX', 'OXY', 'SHELL', 'SLB', 'USO'],
  agriculture: ['DE', 'CAT', 'ADM', 'MOS', 'NTR', 'DBA']
};

// === 5. Watchlist Hook (含强制刷新逻辑) ===
export const useWatchlist = () => {
  const [watchlist, setWatchlist] = useState(() => {
    try {
      // 检查版本号
      const savedVersion = localStorage.getItem('radar_version');
      const savedData = localStorage.getItem('cycle-radar-watchlist');
      
      // 如果版本不匹配，强制重置
      if (savedVersion !== STORAGE_VERSION) {
        localStorage.setItem('radar_version', STORAGE_VERSION);
        localStorage.setItem('cycle-radar-watchlist', JSON.stringify(DEFAULT_STOCKS));
        return DEFAULT_STOCKS;
      }

      return savedData ? JSON.parse(savedData) : DEFAULT_STOCKS;
    } catch {
      return DEFAULT_STOCKS;
    }
  });

  useEffect(() => {
    localStorage.setItem('cycle-radar-watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  // ... (add/remove 方法保持不变，为了节省篇幅省略，但你复制时要保留) ...
  // 为了方便你复制，我把 add/remove 完整写出来：
  
  const addStock = useCallback((sectorId, symbol) => {
    const upperSymbol = symbol.toUpperCase().trim();
    if (!upperSymbol) return false;
    setWatchlist(prev => {
      if (prev[sectorId]?.includes(upperSymbol)) return prev;
      return { ...prev, [sectorId]: [...(prev[sectorId] || []), upperSymbol] };
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

  return { watchlist, addStock, removeStock, getStocksForSector, getAllStocks };
};

export default useStockData;
