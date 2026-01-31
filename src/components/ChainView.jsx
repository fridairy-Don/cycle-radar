import React, { useMemo } from 'react';
import SectorCard from './SectorCard';
import { SECTORS } from '../data/sectors';

const ChainView = ({ etfData, watchlist, onSelectSector, stockData }) => { // 接收 stockData
  
  // === 计算今日全市场涨跌幅榜 ===
  // 站在投资者角度，我进来看完板块，第一反应是：今天全市场谁最牛？
  const topMovers = useMemo(() => {
    // 1. 拿到所有板块的所有股票
    const allSymbols = Object.values(watchlist).flat();
    // 2. 拿到数据并排序
    const sorted = allSymbols
      .map(sym => ({ symbol: sym, ...stockData[sym] }))
      .filter(s => s.dayChangePercent !== undefined)
      .sort((a, b) => b.dayChangePercent - a.dayChangePercent); // 降序

    // 取前3名 (涨幅榜) 和 后3名 (跌幅榜)
    return {
      gainers: sorted.slice(0, 3),
      losers: sorted.slice(-3).reverse()
    };
  }, [watchlist, stockData]);

  // 辅助组件：异动小卡片
  const MoverCard = ({ data, type }) => (
    <div className="flex items-center justify-between bg-white/5 border border-white/5 rounded-lg p-3 mb-2">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-xs text-white 
          ${type === 'up' ? 'bg-[#00FF9D]/10 text-[#00FF9D]' : 'bg-[#FF4D4D]/10 text-[#FF4D4D]'}`}>
          {type === 'up' ? '↑' : '↓'}
        </div>
        <div>
          <div className="font-mono font-bold text-sm text-white">{data.symbol}</div>
          <div className="text-[10px] text-radar-muted truncate max-w-[80px]">{data.nameCN || data.symbol}</div>
        </div>
      </div>
      <div className={`font-mono font-bold text-sm ${type === 'up' ? 'text-[#00FF9D]' : 'text-[#FF4D4D]'}`}>
        {data.dayChangePercent > 0 ? '+' : ''}{data.dayChangePercent?.toFixed(2)}%
      </div>
    </div>
  );

  return (
    <section className="py-4 md:py-8 animate-fade-in pb-20">
      <div className="max-w-7xl mx-auto">
        
        {/* 1. 头部标题 */}
        <div className="px-4 mb-6">
          <h1 className="font-display text-2xl font-bold text-white mb-1">
            周期雷达 <span className="text-radar-accent">2.0</span>
          </h1>
          <p className="text-xs text-radar-muted flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            实时监控全球资金流向
          </p>
        </div>
        
        {/* 2. 横向滑动：全景雷达 */}
        <div className="mb-8">
           <div className="px-4 mb-3 flex justify-between items-end">
             <h2 className="text-sm font-bold text-white/90">传导链总览</h2>
             <span className="text-[10px] text-radar-muted">左右滑动查看完整链路 →</span>
           </div>
           
           <div className="flex flex-nowrap overflow-x-auto snap-x snap-mandatory gap-4 px-4 pb-8 no-scrollbar items-stretch">
            {SECTORS.map((sector, index) => (
              <div key={sector.id} className="snap-center shrink-0 first:pl-0 last:pr-4">
                <SectorCard
                  sector={sector}
                  etfData={etfData}
                  stockCount={watchlist[sector.id]?.length || 0}
                  onClick={() => onSelectSector(sector.id)}
                  isLast={index === SECTORS.length - 1}
                />
              </div>
            ))}
          </div>
        </div>

        {/* 3. 纵向内容：市场异动 (新增内容，填充空白) */}
        <div className="px-4 mb-8">
          <h2 className="text-sm font-bold text-white/90 mb-3 flex items-center gap-2">
            🔥 市场焦点 (全库扫描)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 领涨榜 */}
            <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-4">
              <div className="text-xs text-radar-muted uppercase tracking-wider mb-3">Top Gainers</div>
              {topMovers.gainers.length > 0 ? (
                topMovers.gainers.map(s => <MoverCard key={s.symbol} data={s} type="up" />)
              ) : <div className="text-xs text-radar-muted py-2">数据加载中...</div>}
            </div>
            
            {/* 领跌榜 */}
            <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-4">
              <div className="text-xs text-radar-muted uppercase tracking-wider mb-3">Top Losers</div>
              {topMovers.losers.length > 0 ? (
                topMovers.losers.map(s => <MoverCard key={s.symbol} data={s} type="down" />)
              ) : <div className="text-xs text-radar-muted py-2">数据加载中...</div>}
            </div>
          </div>
        </div>
        
        {/* 4. 底部说明书 (加回来了！) */}
        <div className="px-4">
          <div className="p-5 bg-gradient-to-b from-[#1A1A1A] to-black rounded-xl border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 text-[100px] opacity-5 pointer-events-none">💡</div>
            
            <h3 className="text-sm font-bold text-white mb-2">关于本模型</h3>
            <div className="text-xs text-radar-muted leading-loose space-y-2">
              <p>
                <span className="text-radar-accent">传导逻辑：</span> 
                货币宽松 → 实际利率下行 → 黄金/白银先涨 → 通胀预期升温 → 企业补库存 → 工业金属上涨 → 能源需求增加 → 农产品成本传导。
              </p>
              <p>
                <span className="text-white">如何使用：</span> 
                观察哪个环节正在发热（Hot），提前布局下一环节的优质标的。板块由冷转热时，是最佳关注信号。
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default ChainView;
