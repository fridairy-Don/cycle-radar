import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import ChainView from './components/ChainView';
import SectorDetail from './components/SectorDetail';
import { useStockData, useWatchlist } from './hooks/useStockData';
import { getAllETFSymbols } from './data/sectors';

function App() {
  const [selectedSector, setSelectedSector] = useState(null);

  // 用户股票池
  const { watchlist, addStock, removeStock, getAllStocks } = useWatchlist();

  // 需要获取数据的所有股票代码 (ETF + 用户股票)
  const allSymbols = useMemo(() => {
    const etfSymbols = getAllETFSymbols();
    const userStocks = getAllStocks();
    return [...new Set([...etfSymbols, ...userStocks])];
  }, [getAllStocks]);

  // 获取股票数据
  const { data: stockData, loading, refresh } = useStockData(allSymbols);

  // 返回总览
  const handleBack = () => {
    setSelectedSector(null);
  };

  return (
    <div className="min-h-screen bg-radar-bg">
      <Header onRefresh={refresh} loading={loading} />

      <main>
        {selectedSector ? (
          <SectorDetail
            sectorId={selectedSector}
            etfData={stockData}
            stockData={stockData}
            watchlist={watchlist}
            onBack={handleBack}
            onAddStock={addStock}
            onRemoveStock={removeStock}
          />
        ) : (
          <ChainView
            etfData={stockData}
            watchlist={watchlist}
            onSelectSector={setSelectedSector}
            stockData={stockData} // <--- 关键点：把股票数据传给首页，用于计算异动榜
          />
        )}
      </main>

      {/* 底部版权 */}
      <footer className="border-t border-radar-border/30 py-8 mt-8 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-radar-muted/50 mb-2">
            Cycle Radar · 周期传导链股票仓库
          </p>
          <p className="text-[10px] text-radar-muted/30">
            数据来源: Yahoo Finance · 延迟约15分钟 · 仅供参考，不构成投资建议
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
