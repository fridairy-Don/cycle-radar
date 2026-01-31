import { useState, useEffect, useCallback } from 'react';

// === 核动力数据引擎 ===
// 这里的逻辑已升级：不再直连 Yahoo，而是通过你的 api/stock 中转站加速
export function useStockData(symbols) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    // 如果没有股票代码，就不浪费流量
    if (!symbols || symbols.length === 0) return;
    
    // 只有第一次加载时显示 loading，后续静默刷新
    if (Object.keys(data).length === 0) setLoading(true);
    
    const newData = {};
    
    // 使用 Promise.all 并行请求，速度比串行快 10 倍
    const promises = symbols.map(async (symbol) => {
      try {
        // 关键点：请求你的 Vercel 中转接口
        // 这里的 /api/stock 就是我们刚才创建的那个文件
        const res = await fetch(`/api/stock?symbol=${symbol}`);
        const json = await res.json();
        
        if (json.error) return; 
        
        newData[symbol] = {
          price: json.price,
          changePercent: json.changePercent,
          currency: json.currency,
          // 这里的 valid 标记确保 UI 不会显示 NaN
          valid: true 
        };
      } catch (e) {
        console.error(`Fetch failed for ${symbol}`, e);
        // 失败时保留旧数据，防止闪烁
      }
    });

    await Promise.all(promises);
    
    setData(prev => ({ ...prev, ...newData }));
    setLoading(false);
  }, [JSON.stringify(symbols)]); // 深度依赖检查

  useEffect(() => {
    fetchData();
    // 启用“心跳机制”：每 30 秒自动刷新一次最新价格
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { data, loading, refresh: fetchData };
}

// === 本地保险柜 (Watchlist) ===
// 解决你的需求：无需登录也能永久保存自选股 (使用浏览器本地缓存)
export function useWatchlist() {
  const [watchlist, setWatchlist] = useState(() => {
    try {
      // 尝试从浏览器硬盘读取
      const saved = localStorage.getItem('cycle-radar-watchlist');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  // 自动同步到硬盘
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
