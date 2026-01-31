import React from 'react';

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

// 回撤进度条
const DrawdownBar = ({ value }) => {
  if (value === null || value === undefined) return null;
  
  const absValue = Math.abs(value);
  const width = Math.min(absValue, 50); // 最大显示50%
  
  // 颜色：回撤越深颜色越深
  const getColor = (v) => {
    if (v > 30) return 'bg-red-600';
    if (v > 20) return 'bg-red-500';
    if (v > 10) return 'bg-orange-500';
    if (v > 5) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-radar-border rounded-full overflow-hidden">
        <div 
          className={`h-full ${getColor(absValue)} rounded-full transition-all duration-300`}
          style={{ width: `${(width / 50) * 100}%` }}
        />
      </div>
      <span className="text-xs text-radar-muted font-mono w-14 text-right">
        {formatPercent(value)}
      </span>
    </div>
  );
};

const StockRow = ({ symbol, data, onRemove, onOpenYahoo }) => {
  const isLoading = !data || data.price === null;
  const hasError = data?.error;
  
  const dayChangeClass = data?.dayChangePercent > 0 ? 'price-up' : data?.dayChangePercent < 0 ? 'price-down' : 'text-radar-muted';
  const weekChangeClass = data?.weekChangePercent > 0 ? 'price-up' : data?.weekChangePercent < 0 ? 'price-down' : 'text-radar-muted';
  const monthChangeClass = data?.monthChangePercent > 0 ? 'price-up' : data?.monthChangePercent < 0 ? 'price-down' : 'text-radar-muted';
  
  return (
    <div className="group flex items-center gap-4 py-3 px-4 hover:bg-radar-border/30 rounded-lg transition-colors">
      {/* 股票代码 */}
      <div className="w-20 flex-shrink-0">
        <button
          onClick={() => onOpenYahoo(symbol)}
          className="font-mono text-sm font-medium text-white hover:text-radar-accent transition-colors"
        >
          {symbol}
        </button>
      </div>
      
      {/* 当前价 */}
      <div className="w-24 flex-shrink-0 text-right">
        {isLoading ? (
          <div className="h-4 bg-radar-border rounded animate-pulse w-16 ml-auto"></div>
        ) : hasError ? (
          <span className="text-xs text-red-500">错误</span>
        ) : (
          <span className="font-mono text-sm text-white">{formatPrice(data.price)}</span>
        )}
      </div>
      
      {/* 日涨跌 */}
      <div className="w-20 flex-shrink-0 text-right">
        {isLoading ? (
          <div className="h-4 bg-radar-border rounded animate-pulse w-14 ml-auto"></div>
        ) : (
          <span className={`font-mono text-xs ${dayChangeClass}`}>
            {formatPercent(data?.dayChangePercent)}
          </span>
        )}
      </div>
      
      {/* 周涨跌 */}
      <div className="w-20 flex-shrink-0 text-right hidden md:block">
        {isLoading ? (
          <div className="h-4 bg-radar-border rounded animate-pulse w-14 ml-auto"></div>
        ) : (
          <span className={`font-mono text-xs ${weekChangeClass}`}>
            {formatPercent(data?.weekChangePercent)}
          </span>
        )}
      </div>
      
      {/* 月涨跌 */}
      <div className="w-20 flex-shrink-0 text-right hidden md:block">
        {isLoading ? (
          <div className="h-4 bg-radar-border rounded animate-pulse w-14 ml-auto"></div>
        ) : (
          <span className={`font-mono text-xs ${monthChangeClass}`}>
            {formatPercent(data?.monthChangePercent)}
          </span>
        )}
      </div>
      
      {/* 52周回撤 */}
      <div className="flex-1 hidden lg:block">
        {isLoading ? (
          <div className="h-4 bg-radar-border rounded animate-pulse w-32"></div>
        ) : (
          <DrawdownBar value={data?.drawdown} />
        )}
      </div>
      
      {/* 操作按钮 */}
      <div className="w-20 flex-shrink-0 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onOpenYahoo(symbol)}
          className="p-1.5 rounded hover:bg-radar-border transition-colors"
          title="在Yahoo Finance查看"
        >
          <svg className="w-4 h-4 text-radar-muted hover:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="15,3 21,3 21,9" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="10" y1="14" x2="21" y2="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button
          onClick={() => onRemove(symbol)}
          className="p-1.5 rounded hover:bg-red-500/20 transition-colors"
          title="从列表移除"
        >
          <svg className="w-4 h-4 text-radar-muted hover:text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3,6 5,6 21,6" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default StockRow;
