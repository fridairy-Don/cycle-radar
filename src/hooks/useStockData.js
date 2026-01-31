import { useState, useEffect, useCallback } from 'react';

// === 数据获取 Hook (改为调用 api/stock) ===
export const useStockData = (symbols) => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!symbols || symbols.length === 0) {
      setLoading(false);
      return;
    }
    
    // 如果是首次加载，显示 loading；如果是刷新，静默更新
    if (Object.keys(data).length === 0) setLoading(true);
    setError(null);
    
    try {
      const newData = {};
      
      // 并行请求你的 Vercel 后端接口
      const promises = symbols.map(async (symbol) => {
        try {
          // 这里不再连 Yahoo，而是连你的 API
          const res = await fetch(`/api/stock?symbol=${symbol}`);
          const json = await res.json();
          
          if (json.error) return; // 跳过错误的
          
          // 直接存入数据，字段名与 Claude 原版完全一致
          newData[symbol] = json;
          
        } catch (e) {
          console.error(`Fetch error for ${symbol}`, e);
        }
      });

      await Promise.all(promises);
      
      // 合并新数据
      setData(prev => ({ ...prev, ...newData }));
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(symbols)]); // 深度依赖

  useEffect(() => {
    refresh();
    // 每 30 秒自动刷新一次 (比 Claude 原版 5分钟更快)
    const interval = setInterval(refresh, 30 * 1000);
    return () => clearInterval(interval);
  }, [refresh]);

  return { data, loading, error, refresh };
};

// === 下面是原封不动的 Watchlist 逻辑 (为了保持你的收藏夹功能) ===
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
