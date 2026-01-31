import React from 'react';
import SectorCard from './SectorCard';
import { SECTORS } from '../data/sectors';

const ChainView = ({ etfData, watchlist, onSelectSector }) => {
  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* 标题 */}
        <div className="mb-6">
          <h2 className="font-display text-2xl font-bold text-white mb-2">
            传导链总览
          </h2>
          <p className="text-sm text-radar-muted">
            从左到右，跟随资金流动的脚步。点击板块查看详情。
          </p>
        </div>
        
        {/* 传导链卡片 */}
        <div className="flex flex-wrap lg:flex-nowrap gap-4 lg:gap-0 items-center justify-start overflow-x-auto pb-4">
          {SECTORS.map((sector, index) => (
            <SectorCard
              key={sector.id}
              sector={sector}
              etfData={etfData}
              stockCount={watchlist[sector.id]?.length || 0}
              onClick={() => onSelectSector(sector.id)}
              isLast={index === SECTORS.length - 1}
            />
          ))}
        </div>
        
        {/* 传导说明 */}
        <div className="mt-6 p-4 bg-radar-card/50 rounded-lg border border-radar-border">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-radar-accent/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-radar-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" strokeLinecap="round" />
              </svg>
            </div>
            <div className="text-sm text-radar-muted">
              <p className="mb-2">
                <span className="text-white font-medium">传导逻辑：</span>
                货币宽松 → 实际利率下行 → 黄金/白银先涨 → 通胀预期升温 → 企业补库存 → 工业金属上涨 → 能源需求增加 → 农产品成本传导。
              </p>
              <p>
                <span className="text-white font-medium">如何使用：</span>
                观察哪个环节正在发热，提前布局下一环节的优质标的。板块由冷转热时，是关注信号。
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChainView;
