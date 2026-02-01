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
  sectorId, etfData, stockData, watchlist,
  onBack, onAddStock, onRemoveStock, onStockClick
}) => {
  const sector = getSectorById(sectorId);
  const stocks = watchlist[sectorId] || [];
  
  const [newSymbol, setNewSymbol] = useState('');
  // 默认按日涨跌降序排列（看谁涨得最好）
  const [sortBy, setSortBy] = useState('dayChange'); 
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterDrawdown, setFilterDrawdown] = useState(0); 
  
  const sortedStocks = useMemo(() => {
    let filtered = [...stocks];
    
    // 1. 筛选
    if (filterDrawdown > 0) {
      filtered = filtered.filter(symbol => {
        const data = stockData[symbol];
        return data?.drawdown !== null && Math.abs(data.drawdown) >= filterDrawdown;
      });
    }
    
    // 2. 排序
    filtered.sort((a, b) => {
      const dataA = stockData[a];
      const dataB = stockData[b];
      
      let valueA, valueB;
      
      switch (sortBy) {
        case 'symbol':
          valueA = a; valueB = b; break;
        case 'price':
          valueA = dataA?.price ?? 0; valueB = dataB?.price ?? 0; break;
        case 'dayChange':
          valueA = dataA?.dayChangePercent ?? -999; valueB = dataB?.dayChangePercent ?? -999; break;
        case 'drawdown': // 排序回撤幅度
          valueA = Math.abs(dataA?.drawdown ?? 0); valueB = Math.abs(dataB?.drawdown ?? 0); break;
        default:
          valueA = 0; valueB = 0;
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
      setSortOrder('desc'); // 默认切换新列时用降序（大的在前）
    }
  };

  // 排序按钮组件 (为了代码整洁)
  const SortHeader = ({ field, label, align = 'right' }) => (
    <div 
      onClick={() => handleSort(field)} 
      className={`cursor-pointer flex items-center gap-1 hover:text-white transition-colors py-2
        ${sortBy === field ? 'text-radar-accent font-bold' : ''}
        ${align === 'right' ? 'justify-end' : 'justify-start'}
      `}
    >
      {label}
      <span className="text-[10px] w-3">
        {sortBy === field && (sortOrder === 'asc' ? '▲' : '▼')}
      </span>
    </div>
  );
  
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
    <section className="py-4 md:py-8 animate-fade-in pb-20"> {/* 底部留白防止遮挡 */}
      <div className="max-w-7xl mx-auto px-4">
        {/* 顶部导航 */}
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-radar-muted hover:text-white bg-radar-card/50 px-3 py-1.5 rounded-lg text-sm"
          >
            ← 返回总览
          </button>
        </div>
        
        {/* 板块头部信息 (手机端简化) */}
        <div className="bg-radar-card rounded-xl p-5 mb-6 border border-radar-border/50">
          <div className="flex items-center gap-3 mb-4">
             <span className="text-4xl">{sector.icon}</span>
             <div>
               <h2 className="font-display text-2xl font-bold text-white">{sector.name}</h2>
               <p className="text-xs text-radar-muted">{sector.description}</p>
             </div>
          </div>
          
          {/* ETF卡片网格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sector.etfs.map(etf => {
              const data = etfData[etf.symbol];
              const change = data?.dayChangePercent;
              const changeClass = change > 0 ? 'text-radar-up' : change < 0 ? 'text-radar-down' : 'text-radar-muted';
              
              return (
                <div key={etf.symbol} className="bg-radar-bg/50 rounded-lg p-3 flex items-center justify-between border border-radar-border/30">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{etf.symbol}</span>
                      <span className="text-[10px] bg-white/10 px-1 rounded text-radar-muted">{data?.nameCN || etf.name}</span>
                    </div>
                    <div className="text-xs text-radar-muted mt-1">
                       52周回撤 <span className="text-orange-400">{data?.drawdown ? data.drawdown.toFixed(1) + '%' : '—'}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-mono font-bold text-white">{formatPrice(data?.price)}</div>
                    <div className={`font-mono text-sm font-bold ${changeClass}`}>{formatPercent(change)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* 股票池列表区域 */}
        <div className="bg-radar-card rounded-xl border border-radar-border/50 overflow-hidden">
          {/* 工具栏：添加与筛选 */}
          <div className="p-4 border-b border-radar-border/30 flex flex-col gap-4">
             <div className="flex justify-between items-center">
                <h3 className="font-bold text-white text-lg">精选标的 ({stocks.length})</h3>
                <form onSubmit={handleAddStock} className="flex gap-2">
                  <input
                    type="text" value={newSymbol} onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                    placeholder="代码"
                    className="w-20 bg-radar-bg border border-radar-border rounded px-2 py-1 text-sm text-white focus:outline-none"
                  />
                  <button type="submit" className="bg-radar-accent px-3 py-1 rounded text-sm text-white font-bold">+</button>
                </form>
             </div>
             
             {/* 筛选按钮组 */}
             <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-radar-muted text-xs">回撤筛选:</span>
                {[0, 10, 20, 30].map(v => (
                  <button key={v} onClick={() => setFilterDrawdown(v)}
                    className={`px-2 py-0.5 rounded text-xs transition-colors border ${
                      filterDrawdown === v 
                        ? 'bg-radar-accent border-radar-accent text-white' 
                        : 'bg-transparent border-radar-border text-radar-muted'
                    }`}
                  >
                    {v === 0 ? '全部' : `>${v}%`}
                  </button>
                ))}
             </div>
          </div>
          
          {/* 表头：支持点击排序 */}
          <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-black/20 text-xs text-radar-muted font-bold border-b border-radar-border/30">
            <div className="col-span-4 md:col-span-3"><SortHeader field="symbol" label="名称/代码" align="left"/></div>
            <div className="col-span-4 md:col-span-2 text-right"><SortHeader field="price" label="价格" /></div>
            <div className="col-span-4 md:col-span-2 text-right"><SortHeader field="dayChange" label="日涨跌" /></div>
            {/* 以下两列在手机上隐藏 */}
            <div className="hidden md:block md:col-span-2 text-right">月涨跌</div>
            <div className="hidden md:block md:col-span-2 text-right"><SortHeader field="drawdown" label="回撤" /></div>
            <div className="hidden md:block md:col-span-1"></div>
          </div>
          
          {/* 列表内容 */}
          <div className="divide-y divide-radar-border/20">
            {sortedStocks.map(symbol => (
                <StockRow
                  key={symbol}
                  symbol={symbol}
                  displayName={stockData[symbol]?.nameCN}
                  data={stockData[symbol]}
                  onRemove={(s) => onRemoveStock(sectorId, s)}
                  onClick={() => onStockClick && onStockClick(symbol)}
                />
            ))}
            {sortedStocks.length === 0 && (
                <div className="p-8 text-center text-radar-muted text-sm">暂无符合条件的股票</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SectorDetail;
