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
    if (v > 30) return 'bg-red-500';
    if (v > 20) return 'bg-orange-500';
    if (v > 10) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="flex items-center gap-2 justify-end">
      <div className="w-14 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full ${getColor(absValue)} transition-all`} style={{ width: `${(width / 50) * 100}%` }} />
      </div>
      <span className="text-[10px] text-white/40 font-mono w-8 text-right">{Math.round(absValue)}%</span>
    </div>
  );
};

const StockRow = ({ symbol, displayName, data, onRemove, onClick }) => {
  const isLoading = !data || data.price === undefined;

  const dayChangeClass = data?.dayChangePercent > 0
    ? 'text-emerald-400'
    : data?.dayChangePercent < 0
      ? 'text-red-400'
      : 'text-white/40';

  const monthChangeClass = data?.monthChangePercent > 0
    ? 'text-emerald-400'
    : data?.monthChangePercent < 0
      ? 'text-red-400'
      : 'text-white/40';

  const nameToShow = displayName && displayName !== symbol ? displayName : null;

  return (
    <div
      onClick={onClick}
      className="grid grid-cols-12 gap-2 px-4 py-3.5 hover:bg-white/[0.03] active:bg-white/[0.05] transition-colors items-center group cursor-pointer border-b border-white/[0.03] last:border-b-0"
    >
      {/* 1. 代码与名称 */}
      <div className="col-span-4 md:col-span-3 flex flex-col justify-center">
        <div className="font-mono text-sm font-bold text-white leading-tight group-hover:text-white/90 transition-colors">
          {symbol}
        </div>
        {nameToShow && (
          <div className="text-[10px] text-white/40 mt-0.5 truncate max-w-[100px]">
            {nameToShow}
          </div>
        )}
      </div>

      {/* 2. 当前价 */}
      <div className="col-span-4 md:col-span-2 text-right font-mono text-sm font-medium text-white/90">
        {isLoading ? <span className="animate-pulse text-white/30">···</span> : formatPrice(data.price)}
      </div>

      {/* 3. 日涨跌 */}
      <div className="col-span-4 md:col-span-2 text-right">
        {isLoading ? (
          <span className="animate-pulse text-white/30">···</span>
        ) : (
          <span className={`font-mono text-sm font-bold tabular-nums ${dayChangeClass}`}>
            {formatPercent(data?.dayChangePercent)}
          </span>
        )}
      </div>

      {/* 4. 月涨跌 (仅桌面) */}
      <div className="hidden md:block md:col-span-2 text-right">
        <span className={`font-mono text-xs tabular-nums ${monthChangeClass}`}>
          {formatPercent(data?.monthChangePercent)}
        </span>
      </div>

      {/* 5. 回撤 (仅桌面) */}
      <div className="hidden md:block md:col-span-2 text-right">
        <DrawdownBar value={data?.drawdown} />
      </div>

      {/* 6. 删除按钮 (仅桌面悬停显示) */}
      <div className="hidden md:flex md:col-span-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove && onRemove(symbol);
          }}
          className="text-white/30 hover:text-red-400 transition-colors p-1"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default StockRow;
