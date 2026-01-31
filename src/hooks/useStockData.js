import { useState, useEffect, useCallback } from 'react';

// === 核动力数据引擎 V3 (最终适配版) ===
export function useStockData(symbols) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!symbols || symbols.length === 0) return;
    
    // 首次加载显示loading
    if (Object.keys(data).length === 0) setLoading(true);
    
    const newData = {};
    
    // 并行请求，速度最快
    const promises = symbols.map(async (symbol) => {
      try {
        const res = await fetch(`/api/stock?symbol=${symbol}`);
        const json = await res.json();
        
        if (json.error) return; 
        
        // 关键：这里直接把后端算好的标准字段给前端
        newData[symbol] = {
          price: json.price,
          // Claude 的 UI 组件通常检测这些字段：
          dayChange: json.dayChange,      // 日
          weekChange: json.weekChange,    // 周
          monthChange: json.monthChange,  // 月
          drawdown: json.drawdown,        // 回撤
          
          // 兼容性字段 (有些组件可能读这个旧名字)
          changePercent: json.dayChange, 
          
          valid: true 
        };
      } catch (e) {
        console.error(`Fetch error ${symbol}`, e);
      }
    });

    await Promise.all(promises);
    
    // 更新数据 (保留旧数据，只更新变动的)
    setData(prev => ({ ...prev, ...newData }));
    setLoading(false);
  }, [JSON.stringify(symbols)]);

  useEffect(() => {
    fetchData();
    // 30秒刷新一次
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { data, loading, refresh: fetchData };
}

// Watchlist 部分保持不变，为了方便你复制，我这里也贴上
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
