import React, { useState, useMemo } from 'react';
import StockRow from './StockRow';
import { getSectorById } from '../data/sectors';

const formatPercent = (value) => {
  if (value === null || value === undefined) return '—';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

const formatPrice = (value) => {
  if (value === null || value === undefined) return '—';
  return `$${value.toFixed(2)}`;
};

const SectorDetail = ({ 
  sectorId, 
  etfData, 
  stockData, 
  watchlist, 
  onBack, 
  onAddStock, 
  onRemoveStock 
}) => {
  const sector = getSectorById(sectorId);
  const stocks = watchlist[sectorId] || [];
  
  const [newSymbol, setNewSymbol] = useState('');
  const [sortBy, setSortBy] = useState('symbol'); 
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterDrawdown, setFilterDrawdown] = useState(0); 
  
  const sortedStocks = useMemo(() => {
    let filtered = [...stocks];
    
    if (filterDrawdown > 0) {
      filtered = filtered.filter(symbol => {
        const data = stockData[symbol];
        return data?.drawdown !== null && Math.abs(data.drawdown) >= filterDrawdown;
      });
    }
    
    filtered.sort((a, b) => {
      const dataA = stockData[a];
      const dataB = stockData[b];
      
      let valueA, valueB;
      
      switch (sortBy) {
        case 'dayChange':
          valueA = dataA?.dayChangePercent ?? -999;
          valueB = dataB?.dayChangePercent ?? -999;
          break;
        case 'monthChange':
          valueA = dataA?.monthChangePercent ?? -999;
          valueB = dataB?.monthChangePercent ?? -999;
          break;
        case 'drawdown':
          valueA = Math.abs(dataA?.drawdown ?? 0);
          valueB = Math.abs(dataB?.drawdown ?? 0);
          break;
        default:
          valueA = a;
          valueB = b;
      }
      
      if (sortOrder === 'asc') return valueA > valueB ? 1 : -1;
      return valueA < valueB ? 1 : -1;
    });
    
    return filtered;
  }, [stocks, stockData, sortBy, sortOrder, filterDrawdown]);
  
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };
  
  const handleAddStock = (e) => {
    e.preventDefault();
    if (newSymbol.trim()) {
      onAddStock(sectorId, newSymbol);
      setNewSymbol('');
    }
  };
  
  const handleOpenYahoo = (symbol) => {
    window.open(`https://finance.yahoo.com/quote/${symbol}`, '_blank');
  };
  
  if (!sector) return null;
  
  return (
    <section className="py-8 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4">
        {/* 返回按钮 */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-radar-muted hover:text-white transition-colors bg-radar-card/50 px-4 py-2 rounded-lg"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            返回总览
          </button>
        </div>
        
        {/* 板块头部 */}
        <div className="bg-radar-card rounded-xl p-6 mb-6 border border-radar-border/50">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <span className="text-5xl filter drop-shadow-lg">{sector.icon}</span>
              <div>
                <h2 className="font-display text-3xl font-bold text-white mb-1">
                  {sector.name}
                </h2>
                <p className="text-sm text-radar-muted">{sector.description}</p>
              </div>
            </div>
          </div>
          
          {/* 锚定ETF */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sector.etfs.map(etf => {
              const data = etfData[etf.symbol];
              const change = data?.dayChangePercent;
              const changeClass = change > 0 ? 'text-radar-up' : change < 0 ? 'text-radar-down' : 'text-radar-muted';
              
              return (
                <div key={etf.symbol} className="bg-radar-bg rounded-lg p-5 border border-radar-border/30 hover:border-radar-border transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                          <span className="font-mono text-xl font-bold text-white">{etf.symbol}</span>
                          <span className="text-xs bg-radar-border/50 px-1.5 py-0.5 rounded text-radar-muted">{data?.nameCN || etf.name}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleOpenYahoo(etf.symbol)}
                      className="text-radar-muted hover:text-white"
                      title="View on Yahoo"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" strokeLinecap="round" strokeLinejoin="round"/>
                        <polyline points="15,3 21,3 21,9" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="10" y1="14" x2="21" y2="3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                  
                  <div className="flex items-baseline gap-4 mb-3">
                    <span className="text-3xl font-bold text-white font-mono">{formatPrice(data?.price)}</span>
                    <span className={`font-mono text-lg font-bold ${changeClass}`}>{formatPercent(change)}</span>
                  </div>
                  
                  {/* 数据明细 - 修复显示 */}
                  <div className="grid grid-cols-3 gap-2 text-xs bg-black/20 p-2 rounded-lg">
                    <div className="flex flex-col">
                        <span className="text-radar-muted mb-1">日涨跌</span>
                        <span className={`font-mono font-bold ${data?.dayChangePercent > 0 ? 'text-radar-up' : 'text-radar-down'}`}>
                            {formatPercent(data?.dayChangePercent)}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-radar-muted mb-1">周涨跌</span>
                        <span className={`font-mono font-bold ${data?.weekChangePercent > 0 ? 'text-radar-up' : 'text-radar-down'}`}>
                            {formatPercent(data?.weekChangePercent)}
                        </span>
                    </div>
                     <div className="flex flex-col">
                        <span className="text-radar-muted mb-1">回撤</span>
                        <span className="font-mono text-orange-400 font-bold">
                            {data?.drawdown ? data.drawdown.toFixed(2) + '%' : '—'}
                        </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* 股票池列表 */}
        <div className="bg-radar-card rounded-xl p-6 border border-radar-border/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="font-display text-xl font-bold text-white mb-1">精选标的池</h3>
              <p className="text-sm text-radar-muted">共 {stocks.length} 只 • 点击代码查看详情</p>
            </div>
            
            <form onSubmit={handleAddStock} className="flex items-center gap-2">
              <input
                type="text"
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                placeholder="输入代码 (如 NVDA)"
                className="w-48 bg-radar-bg border border-radar-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-radar-accent"
              />
              <button type="submit" className="bg-radar-accent hover:bg-radar-accent/80 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                添加
              </button>
            </form>
          </div>
          
          {/* 列表头部 */}
          {stocks.length > 0 && (
            <div className="grid grid-cols-12 gap-4 py-3 px-4 text-xs font-bold text-radar-muted border-b border-radar-border uppercase tracking-wider">
              <div onClick={() => handleSort('symbol')} className="col-span-3 cursor-pointer hover:text-white flex items-center gap-1">
                 代码/名称 {sortBy === 'symbol' && (sortOrder === 'asc' ? '↑' : '↓')}
              </div>
              <div className="col-span-2 text-right">价格</div>
              <div onClick={() => handleSort('dayChange')} className="col-span-2 text-right cursor-pointer hover:text-white">
                 日涨跌 {sortBy === 'dayChange' && (sortOrder === 'asc' ? '↑' : '↓')}
              </div>
              <div onClick={() => handleSort('monthChange')} className="col-span-2 text-right cursor-pointer hover:text-white hidden md:block">
                 月涨跌 {sortBy === 'monthChange' && (sortOrder === 'asc' ? '↑' : '↓')}
              </div>
              <div onClick={() => handleSort('drawdown')} className="col-span-2 text-right cursor-pointer hover:text-white hidden lg:block">
                 52周回撤 {sortBy === 'drawdown' && (sortOrder === 'asc' ? '↑' : '↓')}
              </div>
              <div className="col-span-1"></div>
            </div>
          )}
          
          {/* 列表内容 - 注入中文名逻辑 */}
          <div className="divide-y divide-radar-border/30">
            {sortedStocks.map(symbol => {
               const data = stockData[symbol];
               // 注入中文名 (从 data 获取，或者显示代码)
               const displayName = data?.nameCN || symbol;
               
               return (
                <StockRow
                  key={symbol}
                  symbol={symbol}
                  displayName={displayName} // 传给 StockRow
                  data={data} // 包含修正后的涨跌幅
                  onRemove={(s) => onRemoveStock(sectorId, s)}
                  onOpenYahoo={handleOpenYahoo}
                />
               );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SectorDetail;
