import { useState, useEffect, useCallback } from 'react';

// === 数据引擎 V4 (完全修复版) ===
export function useStockData(symbols) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!symbols || symbols.length === 0) return;
    
    if (Object.keys(data).length === 0) setLoading(true);
    
    const newData = {};
    
    // 并行请求
    const promises = symbols.map(async (symbol) => {
      try {
        const res = await fetch(`/api/stock?symbol=${symbol}`);
        const json = await res.json();
        
        if (json.error) return; 
        
        // 【关键】映射所有字段，确保 UI 组件能读到
        newData[symbol] = {
          price: json.price,
          
          // 涨跌幅 (后端给的是小数，如 0.05，UI组件会自动处理成 5%)
          dayChange: json.dayChange,
          weekChange: json.weekChange,
          monthChange: json.monthChange,
          
          // 回撤与极值
          drawdown: json.drawdown,
          high52: json.high52,
          low52: json.low52,
          
          currency: json.currency,
          
          // 有效性标记
          valid: true 
        };
      } catch (e) {
        console.error(`Fetch error ${symbol}`, e);
      }
    });

    await Promise.all(promises);
    
    setData(prev => ({ ...prev, ...newData }));
    setLoading(false);
  }, [JSON.stringify(symbols)]);

  useEffect(() => {
    fetchData();
    // 30秒自动刷新
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Watchlist 逻辑 (保持 Claude 原版)
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

  return { 
    data, 
    loading, 
    refresh: fetchData,
    watchlist, 
    addStock, 
    removeStock, 
    getAllStocks 
  };
}

export { useWatchlist }; // 兼容导出
