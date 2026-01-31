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

  // 异动小卡片
  const MoverCard = ({ data, type }) => (
    <div 
      onClick={() => onStockClick(data.symbol)} 
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
        
        {/* 1. 头部标题 (已修正为绿点 + 实时监控文案) */}
        <div className="px-4 mb-8">
          <h1 className="font-display text-3xl font-bold text-white mb-2 tracking-tight">
            全球宏观雷达
          </h1>
          <p className="text-xs text-radar-muted flex items-center gap-2 font-mono uppercase tracking-widest opacity-90">
            {/* 这里改成了绿点 */}
            <span className="w-2 h-2 rounded-full bg-[#00FF9D] animate-pulse shadow-[0_0_8px_#00FF9D]"></span>
            实时监控全球资金流向
          </p>
        </div>
        
        {/* 2. 全景扫描 */}
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

        {/* 3. 市场焦点 */}
        <div className="px-4 mb-10">
          <h2 className="text-sm font-bold text-white/90 mb-4 border-l-2 border-orange-500 pl-2">
            今日异动 <span className="text-[10px] font-normal text-radar-muted ml-1">(实时轮动)</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 领涨 */}
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
            
            {/* 领跌 */}
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
        
        {/* 4. 底部逻辑说明 (文案已还原) */}
        <div className="px-4">
          <div className="p-5 bg-gradient-to-b from-white/5 to-transparent rounded-xl border border-white/5 relative overflow-hidden backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center text-xs mt-0.5 shrink-0">
                i
              </div>
              <div className="text-xs text-radar-muted leading-relaxed space-y-2">
                <p>
                  <span className="text-white font-bold">传导逻辑：</span> 
                  货币宽松 → 实际利率下行 → 黄金/白银先涨 → 通胀预期升温 → 企业补库存 → 工业金属上涨 → 能源需求增加 → 农产品成本传导。
                </p>
                <p>
                  <span className="text-white font-bold">如何使用：</span> 
                  观察哪个环节正在发热，提前布局下一环节的优质标的。板块由冷转热时，是关注信号。
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
