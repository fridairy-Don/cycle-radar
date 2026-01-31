import React from 'react';
import SectorCard from './SectorCard';
import { SECTORS } from '../data/sectors';

const ChainView = ({ etfData, watchlist, onSelectSector }) => {
  return (
    <section className="py-6 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        {/* 标题区域 */}
        <div className="px-4 mb-4">
          <h2 className="font-display text-xl md:text-2xl font-bold text-white mb-1 flex items-center gap-2">
            传导链总览
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-radar-accent/20 text-radar-accent font-normal hidden md:inline-block">
              资金流向监控
            </span>
          </h2>
          <p className="text-xs text-radar-muted">
            <span className="md:hidden">← 左右滑动查看完整链路 →</span>
            <span className="hidden md:inline">从左到右，跟随资金流动的脚步。点击板块查看详情。</span>
          </p>
        </div>
        
        {/* === 核心升级：横向滑动容器 === 
           flex-nowrap: 不换行
           overflow-x-auto: 允许横向滚动
           snap-x: 滚动时有吸附效果
           no-scrollbar: 隐藏滚动条(美观)
        */}
        <div className="flex flex-nowrap overflow-x-auto snap-x snap-mandatory gap-3 px-4 pb-8 no-scrollbar items-stretch">
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
        
        {/* 底部传导逻辑说明 (仅桌面显示，手机屏幕宝贵，建议精简或隐藏) */}
        <div className="hidden md:block px-4 mt-2">
          <div className="p-4 bg-radar-card/30 rounded-lg border border-radar-border/30 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-radar-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-radar-accent text-xs">ℹ</span>
              </div>
              <div className="text-sm text-radar-muted leading-relaxed">
                <span className="text-white font-medium">传导逻辑：</span>
                货币宽松 → 实际利率下行 → 黄金/白银先涨 → 通胀预期升温 → 企业补库存 → 工业金属上涨 → 能源需求增加 → 农产品成本传导。
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChainView;
