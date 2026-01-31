import React from 'react';

const formatPercent = (value) => {
  if (value === null || value === undefined) return '—';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

const formatPrice = (value) => {
  if (value === null || value === undefined) return '—';
  return `$${value.toFixed(2)}`;
};

// 回撤条 (仅桌面显示)
const DrawdownBar = ({ value }) => {
  if (value === null || value === undefined) return null;
  const absValue = Math.abs(value);
  const width = Math.min(absValue, 50); 
  
  const getColor = (v) => {
    if (v > 30) return 'bg-red-600';
    if (v > 20) return 'bg-red-500';
    if (v > 10) return 'bg-orange-500';
    return 'bg-green-500'; // 回撤小
  };
  
  return (
    <div className="flex items-center gap-2 justify-end">
      <div className="w-16 h-1.5 bg-radar-border/30 rounded-full overflow-hidden">
        <div className={`h-full ${getColor(absValue)}`} style={{ width: `${(width / 50) * 100}%` }} />
      </div>
      <span className="text-[10px] text-radar-muted font-mono w-10 text-right">{Math.round(absValue)}%</span>
    </div>
  );
};

const StockRow = ({ symbol, displayName, data, onRemove, onOpenYahoo }) => {
  const isLoading = !data || data.price === undefined;
  
  const dayChangeClass = data?.dayChangePercent > 0 ? 'text-radar-up' : data?.dayChangePercent < 0 ? 'text-radar-down' : 'text-radar-muted';
  const monthChangeClass = data?.monthChangePercent > 0 ? 'text-radar-up' : data?.monthChangePercent < 0 ? 'text-radar-down' : 'text-radar-muted';
  
  const nameToShow = displayName && displayName !== symbol ? displayName : null;

  return (
    <div className="grid grid-cols-12 gap-2 px-4 py-3 hover:bg-white/5 transition-colors items-center group">
      
      {/* 1. 代码与名称 (手机占4列，桌面占3列) */}
      <div className="col-span-4 md:col-span-3 flex flex-col justify-center cursor-pointer" onClick={() => onOpenYahoo(symbol)}>
        <div className="font-mono text-sm font-bold text-white leading-tight">
          {symbol}
        </div>
        {/* 垂直堆叠中文名，不挤占横向空间 */}
        {nameToShow && (
          <div className="text-[10px] text-radar-muted mt-0.5 truncate max-w-[100px]">
            {nameToShow}
          </div>
        )}
      </div>
      
      {/* 2. 当前价 (手机占4列) */}
      <div className="col-span-4 md:col-span-2 text-right font-mono text-sm font-medium text-white">
        {isLoading ? <span className="animate-pulse">...</span> : formatPrice(data.price)}
      </div>
      
      {/* 3. 日涨跌 (手机占4列) */}
      <div className="col-span-4 md:col-span-2 text-right">
        {isLoading ? <span className="animate-pulse">...</span> : (
          <span className={`font-mono text-sm font-bold ${dayChangeClass}`}>
            {formatPercent(data?.dayChangePercent)}
          </span>
        )}
      </div>
      
      {/* 4. 月涨跌 (仅桌面) */}
      <div className="hidden md:block md:col-span-2 text-right">
        <span className={`font-mono text-xs ${monthChangeClass}`}>
            {formatPercent(data?.monthChangePercent)}
        </span>
      </div>
      
      {/* 5. 回撤 (仅桌面) */}
      <div className="hidden md:block md:col-span-2 text-right">
        <DrawdownBar value={data?.drawdown} />
      </div>
      
      {/* 6. 删除按钮 (仅桌面悬停显示) */}
      <div className="hidden md:flex md:col-span-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={(e) => { e.stopPropagation(); onRemove(symbol); }} className="text-radar-muted hover:text-red-500">
           <span className="text-lg">×</span>
        </button>
      </div>
      
    </div>
  );
};

export default StockRow;
