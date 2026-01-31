import { useState, useEffect, useCallback } from 'react';

// === 核动力数据引擎 V2 (修复版) ===
export function useStockData(symbols) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!symbols || symbols.length === 0) return;
    
    // 首次加载显示 loading，后续静默刷新
    if (Object.keys(data).length === 0) setLoading(true);
    
    const newData = {};
    
    const promises = symbols.map(async (symbol) => {
      try {
        // 请求升级后的后端接口
        const res = await fetch(`/api/stock?symbol=${symbol}`);
        const json = await res.json();
        
        if (json.error) return; 
        
        // 【关键修复】这里把所有字段都传给 UI
        newData[symbol] = {
          price: json.price,
          changePercent: json.changePercent,   // 日涨跌
          weekChangePercent: json.weekChangePercent, // 周涨跌
          drawdown: json.drawdown,             // 回撤 (用于显示冷热标签)
          high52: json.high52,                 // 52周最高
          currency: json.currency,
          valid: true 
        };
      } catch (e) {
        console.error(`Fetch failed for ${symbol}`, e);
      }
    });

    await Promise.all(promises);
    
    setData(prev => ({ ...prev, ...newData }));
    setLoading(false);
  }, [JSON.stringify(symbols)]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // 30秒刷新
    return () => clearInterval(interval);
  }, [fetchData]);

  return { data, loading, refresh: fetchData };
}

// Watchlist 逻辑保持不变
export function useWatchlist() {
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const saved = localStorage.getItem('cycle-radar-watchlist');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  const saveToDisk = (newList) => {
    setWatchlist(newList);
    localStorage.setItem('cycle-radar-watchlist', JSON.stringify(newList));
  };

  const addStock = (sectorId, symbol) => {
    const currentList = watchlist[sectorId] || [];
    if (!currentList.includes(symbol)) {
      saveToDisk({ ...watchlist, [sectorId]: [...currentList, symbol] });
    }
  };

  const removeStock = (sectorId, symbol) => {
    const currentList = watchlist[sectorId] || [];
    saveToDisk({
      ...watchlist,
      [sectorId]: currentList.filter(s => s !== symbol)
    });
  };

  const getAllStocks = () => {
    return Object.values(watchlist).flat();
  };

  return { watchlist, addStock, removeStock, getAllStocks };
}
