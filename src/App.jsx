import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import ChainView from './components/ChainView';
import SectorDetail from './components/SectorDetail';
import StockDetailModal from './components/StockDetailModal'; // 引入新弹窗
import { useStockData, useWatchlist } from './hooks/useStockData';
import { getAllETFSymbols } from './data/sectors';

function App() {
  const [selectedSector, setSelectedSector] = useState(null);
  const [selectedStock, setSelectedStock] = useState(null); // 新增：当前选中的股票详情

  // 用户股票池
  const { watchlist, addStock, removeStock, getAllStocks } = useWatchlist();

  // 安全地计算所有股票代码
  const allSymbols = useMemo(() => {
    try {
      const etfSymbols = getAllETFSymbols();
      const userStocks = getAllStocks ? getAllStocks() : [];
      return [...new Set([...etfSymbols, ...userStocks])];
    } catch (e) {
      console.error("Error calculating symbols:", e);
      return getAllETFSymbols(); 
    }
  }, [getAllStocks]);

  // 获取数据
  const { data: stockData, loading, refresh } = useStockData(allSymbols);

  // 返回首页逻辑
  const goHome = () => {
    setSelectedSector(null);
    setSelectedStock(null);
  };

  return (
    <div className="min-h-screen bg-radar-bg font-sans">
      <Header onRefresh={refresh} loading={loading} onGoHome={goHome} />

      <main>
        {selectedSector ? (
          <SectorDetail
            sectorId={selectedSector}
            etfData={stockData || {}}
            stockData={stockData || {}}
            watchlist={watchlist || {}}
            onBack={goHome} 
            onAddStock={addStock}
            onRemoveStock={removeStock}
            // 传递点击事件：打开详情弹窗
            onStockClick={(symbol) => setSelectedStock(symbol)} 
          />
        ) : (
          <ChainView
            etfData={stockData || {}}
            watchlist={watchlist || {}}
            onSelectSector={setSelectedSector}
            stockData={stockData || {}} 
            // 传递点击事件：打开详情弹窗
            onStockClick={(symbol) => setSelectedStock(symbol)}
          />
        )}
      </main>

      {/* === 全局弹窗层 === */}
      {selectedStock && (
        <StockDetailModal 
          symbol={selectedStock} 
          onClose={() => setSelectedStock(null)} 
        />
      )}

      <footer className="border-t border-radar-border/30 py-8 mt-8 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-radar-muted/50 mb-2 font-mono">
            GLOBAL MACRO RADAR · V3.2
          </p>
          <p className="text-[10px] text-radar-muted/30">
            Data sourced from Yahoo Finance via Vercel Edge.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
