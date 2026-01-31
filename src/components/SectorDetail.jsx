import React, { useState, useMemo } from 'react';
import StockRow from './StockRow';
import { getSectorById } from '../data/sectors';

// 格式化百分比
const formatPercent = (value) => {
  if (value === null || value === undefined) return '—';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

// 格式化价格
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
  const [sortBy, setSortBy] = useState('symbol'); // symbol, dayChange, monthChange, drawdown
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterDrawdown, setFilterDrawdown] = useState(0); // 0, 10, 20, 30
  
  // 排序和筛选后的股票列表
  const sortedStocks = useMemo(() => {
    let filtered = [...stocks];
    
    // 筛选回撤
    if (filterDrawdown > 0) {
      filtered = filtered.filter(symbol => {
        const data = stockData[symbol];
        return data?.drawdown !== null && Math.abs(data.drawdown) >= filterDrawdown;
      });
    }
    
    // 排序
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
      
      if (sortOrder === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
    
    return filtered;
  }, [stocks, stockData, sortBy, sortOrder, filterDrawdown]);
  
  // 切换排序
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };
  
  // 添加股票
  const handleAddStock = (e) => {
    e.preventDefault();
    if (newSymbol.trim()) {
      onAddStock(sectorId, newSymbol);
      setNewSymbol('');
    }
  };
  
  // 打开Yahoo Finance
  const handleOpenYahoo = (symbol) => {
    window.open(`https://finance.yahoo.com/quote/${symbol}`, '_blank');
  };
  
  if (!sector) return null;
  
  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* 返回按钮和标题 */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-radar-muted hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            返回总览
          </button>
        </div>
        
        {/* 板块头部 */}
        <div className="bg-radar-card rounded-xl p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <span className="text-4xl">{sector.icon}</span>
              <div>
                <h2 className="font-display text-2xl font-bold text-white">
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
              const monthChange = data?.monthChangePercent;
              const changeClass = monthChange > 0 ? 'price-up' : monthChange < 0 ? 'price-down' : 'text-radar-muted';
              
              return (
                <div key={etf.symbol} className="bg-radar-bg rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-mono text-lg font-bold text-white">{etf.symbol}</span>
                      <p className="text-xs text-radar-muted">{etf.name}</p>
                    </div>
                    <button
                      onClick={() => handleOpenYahoo(etf.symbol)}
                      className="p-2 rounded-lg hover:bg-radar-border transition-colors"
                      title="在Yahoo Finance查看"
                    >
                      <svg className="w-4 h-4 text-radar-muted hover:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" strokeLinecap="round" strokeLinejoin="round"/>
                        <polyline points="15,3 21,3 21,9" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="10" y1="14" x2="21" y2="3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl font-bold text-white">{formatPrice(data?.price)}</span>
                    <span className={`font-mono ${changeClass}`}>{formatPercent(monthChange)} <span className="text-radar-muted text-xs">月</span></span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs">
                    <span className="text-radar-muted">
                      日 <span className={data?.dayChangePercent > 0 ? 'price-up' : 'price-down'}>{formatPercent(data?.dayChangePercent)}</span>
                    </span>
                    <span className="text-radar-muted">
                      周 <span className={data?.weekChangePercent > 0 ? 'price-up' : 'price-down'}>{formatPercent(data?.weekChangePercent)}</span>
                    </span>
                    <span className="text-radar-muted">
                      52周高点回撤 <span className="text-orange-500">{formatPercent(data?.drawdown)}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* 股票池 */}
        <div className="bg-radar-card rounded-xl p-6">
          {/* 标题和添加 */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="font-display text-lg font-bold text-white">股票池</h3>
              <p className="text-sm text-radar-muted">{stocks.length} 只股票</p>
            </div>
            
            <form onSubmit={handleAddStock} className="flex items-center gap-2">
              <input
                type="text"
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                placeholder="输入股票代码，如 AAPL"
                className="w-48"
              />
              <button type="submit" className="btn-primary">
                添加
              </button>
            </form>
          </div>
          
          {/* 筛选和排序 */}
          {stocks.length > 0 && (
            <div className="flex flex-wrap items-center gap-4 mb-4 pb-4 border-b border-radar-border">
              {/* 回撤筛选 */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-radar-muted">回撤筛选:</span>
                <div className="flex items-center gap-1">
                  {[0, 10, 20, 30].map(v => (
                    <button
                      key={v}
                      onClick={() => setFilterDrawdown(v)}
                      className={`px-2 py-1 text-xs rounded ${
                        filterDrawdown === v 
                          ? 'bg-radar-accent text-white' 
                          : 'bg-radar-border text-radar-muted hover:text-white'
                      }`}
                    >
                      {v === 0 ? '全部' : `>${v}%`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* 表头 */}
          {stocks.length > 0 && (
            <div className="flex items-center gap-4 py-2 px-4 text-xs text-radar-muted border-b border-radar-border">
              <button 
                onClick={() => handleSort('symbol')}
                className={`w-20 flex-shrink-0 text-left hover:text-white ${sortBy === 'symbol' ? 'text-white' : ''}`}
              >
                代码 {sortBy === 'symbol' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
              <div className="w-24 flex-shrink-0 text-right">当前价</div>
              <button 
                onClick={() => handleSort('dayChange')}
                className={`w-20 flex-shrink-0 text-right hover:text-white ${sortBy === 'dayChange' ? 'text-white' : ''}`}
              >
                日涨跌 {sortBy === 'dayChange' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
              <div className="w-20 flex-shrink-0 text-right hidden md:block">周涨跌</div>
              <button 
                onClick={() => handleSort('monthChange')}
                className={`w-20 flex-shrink-0 text-right hidden md:block hover:text-white ${sortBy === 'monthChange' ? 'text-white' : ''}`}
              >
                月涨跌 {sortBy === 'monthChange' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
              <button 
                onClick={() => handleSort('drawdown')}
                className={`flex-1 text-left hidden lg:block hover:text-white ${sortBy === 'drawdown' ? 'text-white' : ''}`}
              >
                52周回撤 {sortBy === 'drawdown' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
              <div className="w-20 flex-shrink-0"></div>
            </div>
          )}
          
          {/* 股票列表 */}
          {stocks.length === 0 ? (
            <div className="py-12 text-center">
              <div className="text-4xl mb-4">📦</div>
              <p className="text-radar-muted mb-2">这个板块还没有股票</p>
              <p className="text-sm text-radar-muted">在上方输入股票代码添加</p>
            </div>
          ) : sortedStocks.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-radar-muted">没有符合筛选条件的股票</p>
            </div>
          ) : (
            <div className="divide-y divide-radar-border/50">
              {sortedStocks.map(symbol => (
                <StockRow
                  key={symbol}
                  symbol={symbol}
                  data={stockData[symbol]}
                  onRemove={(s) => onRemoveStock(sectorId, s)}
                  onOpenYahoo={handleOpenYahoo}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SectorDetail;
