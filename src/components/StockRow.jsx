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
      <div className="w-24 h-2 bg-radar-border/50 rounded-full overflow-hidden">
        <div 
          className={`h-full ${getColor(absValue)} rounded-full transition-all duration-500`}
          style={{ width: `${(width / 50) * 100}%` }}
        />
      </div>
      <span className="text-[10px] text-radar-muted font-mono w-14 text-right">
        {formatPercent(value)}
      </span>
    </div>
  );
};

// 核心组件
const StockRow = ({ symbol, displayName, data, onRemove, onOpenYahoo }) => {
  // 注意：这里 data 是从上层 SectorDetail 传进来的，已经包含了修正后的数据
  const isLoading = !data || data.price === undefined;
  const hasError = data?.error;
  
  const dayChangeClass = data?.dayChangePercent > 0 ? 'text-radar-up' : data?.dayChangePercent < 0 ? 'text-radar-down' : 'text-radar-muted';
  const weekChangeClass = data?.weekChangePercent > 0 ? 'text-radar-up' : data?.weekChangePercent < 0 ? 'text-radar-down' : 'text-radar-muted';
  const monthChangeClass = data?.monthChangePercent > 0 ? 'text-radar-up' : data?.monthChangePercent < 0 ? 'text-radar-down' : 'text-radar-muted';
  
  // 决定显示的名称 (如果有中文名且不等于代码，则显示中文名)
  const nameToShow = displayName && displayName !== symbol ? displayName : symbol;

  return (
    <div className="group grid grid-cols-12 gap-4 py-3 px-4 hover:bg-white/5 rounded-lg transition-colors items-center border-b border-transparent hover:border-radar-border/30">
      
      {/* 1. 股票代码 & 名称 (占据 3 列) */}
      <div className="col-span-3 flex flex-col justify-center">
        <div className="flex items-center gap-2">
            <button
            onClick={() => onOpenYahoo(symbol)}
            className="font-mono text-sm font-bold text-white hover:text-radar-accent transition-colors text-left"
            >
            {symbol}
            </button>
            {/* 显示中文名标签 */}
            {nameToShow !== symbol && (
                <span className="text-[10px] bg-radar-border/30 px-1.5 rounded text-radar-muted truncate max-w-[80px]">
                    {nameToShow}
                </span>
            )}
        </div>
        {/* 如果没有中文名，显示全名 (可选) */}
        {nameToShow === symbol && (
            <span className="text-[10px] text-radar-muted truncate max-w-[120px] opacity-50">
                {symbol}
            </span>
        )}
      </div>
      
      {/* 2. 当前价 (占据 2 列) */}
      <div className="col-span-2 text-right font-mono text-sm font-medium text-white">
        {isLoading ? (
          <div className="h-4 bg-radar-border/50 rounded animate-pulse w-16 ml-auto"></div>
        ) : hasError ? (
          <span className="text-xs text-red-500">Error</span>
        ) : (
          formatPrice(data.price)
        )}
      </div>
      
      {/* 3. 日涨跌 (占据 2 列) */}
      <div className="col-span-2 text-right">
        {isLoading ? (
          <div className="h-4 bg-radar-border/50 rounded animate-pulse w-12 ml-auto"></div>
        ) : (
          <span className={`font-mono text-sm font-bold ${dayChangeClass}`}>
            {formatPercent(data?.dayChangePercent)}
          </span>
        )}
      </div>
      
      {/* 4. 月涨跌 (占据 2 列 - 隐藏在小屏幕) */}
      <div className="col-span-2 text-right hidden md:block">
        {isLoading ? (
          <div className="h-4 bg-radar-border/50 rounded animate-pulse w-12 ml-auto"></div>
        ) : (
          <span className={`font-mono text-xs ${monthChangeClass}`}>
            {formatPercent(data?.monthChangePercent)}
          </span>
        )}
      </div>
      
      {/* 5. 52周回撤 (占据 2 列 - 隐藏在中屏幕) */}
      <div className="col-span-2 hidden lg:flex items-center justify-end">
        {isLoading ? (
          <div className="h-2 bg-radar-border/50 rounded animate-pulse w-24"></div>
        ) : (
          <DrawdownBar value={data?.drawdown} />
        )}
      </div>
      
      {/* 6. 操作按钮 (占据 1 列 - 悬停显示) */}
      <div className="col-span-1 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onRemove(symbol)}
          className="p-1.5 rounded-md hover:bg-red-500/20 text-radar-muted hover:text-red-500 transition-colors"
          title="移除"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
    </div>
  );
};

export default StockRow;
