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
  
  // 需要获取数据的所有股票代码（ETF + 用户股票）
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
          />
        )}
      </main>
      
      {/* 底部 */}
      <footer className="border-t border-radar-border py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-radar-muted">
            <p>
              Cycle Radar · 周期传导链股票仓库
            </p>
            <p>
              数据来源: Yahoo Finance · 延迟约15分钟 · 仅供参考，不构成投资建议
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
