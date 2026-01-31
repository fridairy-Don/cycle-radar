import React, { useMemo } from 'react';
import SectorCard from './SectorCard';
import { SECTORS } from '../data/sectors';

// 接收 onStockClick
const ChainView = ({ etfData, watchlist, onSelectSector, stockData, onStockClick }) => {
  
  // === 实时计算异动榜 ===
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
        gainers: sorted.slice(0, 3), // 前3名
        losers: sorted.slice(-3).reverse() // 倒数3名
      };
    } catch (e) {
      return { gainers: [], losers: [] };
    }
  }, [watchlist, stockData]);

  // === 辅助组件：异动小卡片 (改为调用 onStockClick) ===
  const MoverCard = ({ data, type }) => (
    <div 
      onClick={() => onStockClick(data.symbol)} // <--- 这里改了：触发弹窗
      className="flex items-center justify-between bg-white/5 border border-white/5 rounded-lg p-3 mb-2 cursor-pointer hover:bg-white/10 hover:border-white/20 transition-all active:scale-95"
    >
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-xs text-white shadow-lg
          ${type === 'up' ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 text-[#00FF9D]' : 'bg-gradient-to-br from-red-500/20 to-rose-500/20 text-[#FF4D4D]'}`}>
          {type === 'up' ? '↑' : '↓'}
        </div>
        <div>
          <div className="font-mono font-bold text-sm text-white flex items-center gap-2">
            {data.symbol}
            {/* Info Icon */}
            <svg className="w-3 h-3 text-radar-muted opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          </div>
          <div className="text-[10px] text-radar-muted truncate max-w-[100px]">{data.nameCN || data.symbol}</div>
        </div>
      </div>
      <div className={`font-mono font-bold text-sm ${type === 'up' ? 'text-[#00FF9D]' : 'text-[#FF4D4D]'}`}>
        {data.dayChangePercent > 0 ? '+' : ''}{data.dayChangePercent?.toFixed(2)}%
      </div>
    </div>
  );

  return (
    <section className="py-6 animate-fade-in pb-20">
      <div className="max-w-7xl mx-auto">
        
        {/* 1. 品牌升级头部 */}
        <div className="px-4 mb-8">
          <h1 className="font-display text-3xl font-bold text-white mb-1 tracking-tight">
            全球宏观雷达
          </h1>
          <p className="text-xs text-radar-muted flex items-center gap-2 font-mono uppercase tracking-widest opacity-80">
            <span className="w-1.5 h-1.5 rounded-full bg-radar-accent animate-pulse"></span>
            资金流向 · 周期轮动
          </p>
        </div>
        
        {/* 2. 横向滑动：全景雷达 */}
        <div className="mb-10">
           <div className="px-4 mb-3 flex justify-between items-end">
             <h2 className="text-sm font-bold text-white/90 border-l-2 border-radar-accent pl-2">全景扫描</h2>
             <span className="text-[10px] text-radar-muted">滑动查看完整链路 →</span>
           </div>
           
           <div className="flex flex-nowrap overflow-x-auto snap-x snap-mandatory gap-4 px-4 pb-8 no-scrollbar items-stretch">
            {SECTORS.map((sector, index) => (
              <div key={sector.id} className="snap-center shrink-0 first:pl-0 last:pr-4">
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
        </div>

        {/* 3. 市场焦点 (交互升级版) */}
        <div className="px-4 mb-10">
          <h2 className="text-sm font-bold text-white/90 mb-4 border-l-2 border-orange-500 pl-2">
            今日异动 <span className="text-[10px] font-normal text-radar-muted ml-1">(实时轮动)</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 领涨榜 */}
            <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-4 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs text-[#00FF9D] font-bold uppercase tracking-wider flex items-center gap-1">
                   🚀 领涨榜 (Bulls)
                </div>
              </div>
              {topMovers.gainers.length > 0 ? (
                topMovers.gainers.map(s => <MoverCard key={s.symbol} data={s} type="up" />)
              ) : <div className="text-xs text-radar-muted py-4 text-center">扫描市场数据中...</div>}
            </div>
            
            {/* 领跌榜 */}
            <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-4 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs text-[#FF4D4D] font-bold uppercase tracking-wider flex items-center gap-1">
                   🐻 领跌榜 (Bears)
                </div>
              </div>
              {topMovers.losers.length > 0 ? (
                topMovers.losers.map(s => <MoverCard key={s.symbol} data={s} type="down" />)
              ) : <div className="text-xs text-radar-muted py-4 text-center">扫描市场数据中...</div>}
            </div>
          </div>
        </div>
        
        {/* 4. 底部逻辑说明 */}
        <div className="px-4">
          <div className="p-5 bg-gradient-to-b from-white/5 to-transparent rounded-xl border border-white/5 relative overflow-hidden backdrop-blur-sm">
            <h3 className="text-xs font-bold text-white mb-3 uppercase tracking-wider opacity-70">Core Logic / 核心逻辑</h3>
            <div className="text-xs text-radar-muted leading-loose space-y-2 font-mono">
              <p>
                <span className="text-radar-accent">👉 传导链：</span> 
                货币宽松 → 实际利率下行 → 黄金/白银先涨 → 通胀预期升温 → 企业补库存 → 工业金属上涨 → 能源需求增加 → 农产品成本传导。
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default ChainView;
