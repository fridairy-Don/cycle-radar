import React, { useMemo } from 'react';
import SectorCard from './SectorCard';
import { SECTORS } from '../data/sectors';

const ChainView = ({ etfData, watchlist, onSelectSector, stockData, onStockClick }) => {

  const topMovers = useMemo(() => {
    if (!watchlist || !stockData || Object.keys(stockData).length === 0) {
      return { gainers: [], losers: [] };
    }
    try {
      const allSymbols = Object.values(watchlist).flat();
      const sorted = allSymbols
        .map(sym => {
          const data = stockData[sym];
          return data ? { symbol: sym, ...data } : null;
        })
        .filter(s => s && s.dayChangePercent !== undefined)
        .sort((a, b) => b.dayChangePercent - a.dayChangePercent);

      return {
        gainers: sorted.slice(0, 3),
        losers: sorted.slice(-3).reverse()
      };
    } catch (e) {
      return { gainers: [], losers: [] };
    }
  }, [watchlist, stockData]);

  // 计算热度指标
  const heatStats = useMemo(() => {
    const sectorHeats = SECTORS.map(sector => {
      const etfChanges = sector.etfs.map(etf => stockData?.[etf.symbol]?.dayChangePercent || 0);
      const avgChange = etfChanges.length > 0 ? etfChanges.reduce((a, b) => a + b, 0) / etfChanges.length : 0;
      return { id: sector.id, name: sector.name, icon: sector.icon, avgChange };
    });

    const hottest = [...sectorHeats].sort((a, b) => b.avgChange - a.avgChange)[0];
    const coldest = [...sectorHeats].sort((a, b) => a.avgChange - b.avgChange)[0];

    return { hottest, coldest };
  }, [stockData]);

  // 异动小卡片 - 升级版
  const MoverCard = ({ data, type, rank }) => (
    <div
      onClick={() => onStockClick && onStockClick(data.symbol)}
      className="flex items-center gap-3 bg-gradient-to-r from-white/[0.03] to-transparent border border-white/[0.05] rounded-xl p-3 cursor-pointer hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300 active:scale-[0.98] group"
    >
      {/* 排名徽章 */}
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0
        ${type === 'up'
          ? 'bg-gradient-to-br from-emerald-500/20 to-green-600/20 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
          : 'bg-gradient-to-br from-red-500/20 to-rose-600/20 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
        }`}
      >
        {rank}
      </div>

      {/* 股票信息 */}
      <div className="flex-1 min-w-0">
        <div className="font-mono font-bold text-sm text-white group-hover:text-white/90 transition-colors">
          {data.symbol}
        </div>
        <div className="text-[10px] text-white/40 truncate">{data.nameCN || '—'}</div>
      </div>

      {/* 涨跌幅 */}
      <div className={`font-mono font-bold text-sm tabular-nums ${type === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
        {data.dayChangePercent > 0 ? '+' : ''}{data.dayChangePercent?.toFixed(2)}%
      </div>
    </div>
  );

  // 热度指示器组件
  const HeatIndicator = ({ sector, type }) => {
    if (!sector) return null;
    const isHot = type === 'hot';
    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${
        isHot
          ? 'bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20'
          : 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/20'
      }`}>
        <span className="text-lg">{sector.icon}</span>
        <div>
          <div className="text-[10px] text-white/40 uppercase tracking-wider">{isHot ? '最热板块' : '最冷板块'}</div>
          <div className="text-xs font-bold text-white">{sector.name}</div>
        </div>
        <div className={`ml-auto text-xs font-mono font-bold ${isHot ? 'text-orange-400' : 'text-blue-400'}`}>
          {sector.avgChange > 0 ? '+' : ''}{sector.avgChange?.toFixed(2)}%
        </div>
      </div>
    );
  };

  return (
    <section className="py-4 animate-fade-in pb-24">
      <div className="max-w-7xl mx-auto">

        {/* ===== 1. 头部区域 - 极简高级 ===== */}
        <div className="px-4 mb-6">
          {/* 主标题 */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight">
                全球宏观雷达
              </h1>
              <p className="text-[11px] text-white/40 flex items-center gap-2 mt-1 font-mono">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                实时监控 · 周期传导
              </p>
            </div>
          </div>

          {/* 热度速览 */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            <HeatIndicator sector={heatStats.hottest} type="hot" />
            <HeatIndicator sector={heatStats.coldest} type="cold" />
          </div>
        </div>

        {/* ===== 2. 周期传导链 - 横向滚动卡片 ===== */}
        <div className="mb-8">
          <div className="px-4 mb-3 flex justify-between items-center">
            <h2 className="text-xs font-bold text-white/70 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-4 bg-gradient-to-b from-radar-accent to-orange-600 rounded-full"></span>
              周期传导链
            </h2>
            <span className="text-[10px] text-white/30 font-mono">← 滑动查看 →</span>
          </div>

          <div className="flex flex-nowrap overflow-x-auto snap-x snap-mandatory gap-3 px-4 pb-4 no-scrollbar items-stretch">
            {SECTORS.map((sector, index) => (
              <div key={sector.id} className="snap-center shrink-0">
                <SectorCard
                  sector={sector}
                  etfData={etfData || {}}
                  stockCount={watchlist && watchlist[sector.id] ? watchlist[sector.id].length : 0}
                  onClick={() => onSelectSector(sector.id)}
                  isLast={index === SECTORS.length - 1}
                />
              </div>
            ))}
          </div>

          {/* 传导箭头提示 */}
          <div className="px-4 mt-2">
            <div className="flex items-center justify-center gap-1 text-[10px] text-white/20 font-mono">
              {SECTORS.slice(0, 5).map((s, i) => (
                <React.Fragment key={s.id}>
                  <span>{s.icon}</span>
                  {i < 4 && <span className="text-white/10">→</span>}
                </React.Fragment>
              ))}
              <span className="text-white/10">→ ...</span>
            </div>
          </div>
        </div>

        {/* ===== 3. 今日异动 - 双栏布局 ===== */}
        <div className="px-4 mb-8">
          <h2 className="text-xs font-bold text-white/70 uppercase tracking-widest flex items-center gap-2 mb-4">
            <span className="w-1 h-4 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full"></span>
            今日异动
            <span className="text-[10px] font-normal text-white/30 ml-1 normal-case">实时轮动</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 领涨榜 */}
            <div className="bg-gradient-to-br from-emerald-500/[0.03] to-transparent border border-emerald-500/10 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <span className="text-emerald-400 text-xs">↑</span>
                </div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">领涨榜</span>
              </div>
              <div className="space-y-2">
                {topMovers.gainers.length > 0 ? (
                  topMovers.gainers.map((s, i) => <MoverCard key={s.symbol} data={s} type="up" rank={i + 1} />)
                ) : (
                  <div className="text-xs text-white/30 py-6 text-center">扫描市场数据中...</div>
                )}
              </div>
            </div>

            {/* 领跌榜 */}
            <div className="bg-gradient-to-br from-red-500/[0.03] to-transparent border border-red-500/10 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <span className="text-red-400 text-xs">↓</span>
                </div>
                <span className="text-xs font-bold text-red-400 uppercase tracking-wider">领跌榜</span>
              </div>
              <div className="space-y-2">
                {topMovers.losers.length > 0 ? (
                  topMovers.losers.map((s, i) => <MoverCard key={s.symbol} data={s} type="down" rank={i + 1} />)
                ) : (
                  <div className="text-xs text-white/30 py-6 text-center">扫描市场数据中...</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ===== 4. 使用说明 - 极简版 ===== */}
        <div className="px-4">
          <div className="p-4 bg-gradient-to-br from-white/[0.02] to-transparent rounded-2xl border border-white/[0.05]">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 flex items-center justify-center text-amber-400 shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-[11px] text-white/50 leading-relaxed space-y-2">
                <p>
                  <span className="text-white/80 font-medium">传导逻辑：</span>
                  货币宽松 → 黄金白银 → 工业金属 → 能源 → 农产品
                </p>
                <p>
                  <span className="text-white/80 font-medium">使用方法：</span>
                  观察板块冷热状态，关注"由冷转热"的关键时机
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default ChainView;
