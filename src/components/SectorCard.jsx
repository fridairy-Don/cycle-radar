import React from 'react';

// === 冷热判断逻辑优化 ===
// 逻辑：看龙头的回撤幅度 (Drawdown)
// 回撤 < 5% = 🔥 热 (接近新高)
// 回撤 > 15% = ❄️ 冷 (超跌)
// 其他 = ☁️ 温
const getTemperature = (etfs, etfData) => {
  if (!etfs || etfs.length === 0) return { label: '—', class: 'tag-warm' };
  
  // 取第一个 ETF (通常是板块龙头, 如 XLE) 的数据
  const mainETF = etfs[0].symbol;
  const data = etfData[mainETF];

  if (!data || data.drawdown === undefined) return { label: '—', class: 'tag-warm' };

  // 注意：API 返回的 drawdown 是负数 (如 -3.5)
  const dd = Math.abs(data.drawdown);

  if (dd < 5) return { label: '热', class: 'tag-hot' }; // 接近新高
  if (dd > 15) return { label: '冷', class: 'tag-cold' }; // 跌多了
  return { label: '温', class: 'tag-warm' };
};

const formatPercent = (value) => {
  if (value === null || value === undefined) return '—';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

const formatPrice = (value) => {
  if (value === null || value === undefined) return '—';
  return `$${value.toFixed(2)}`;
};

const SectorCard = ({ sector, etfData, stockCount, onClick, isLast }) => {
  const temp = getTemperature(sector.etfs, etfData);
  
  return (
    <div className="relative flex items-center">
      <div 
        onClick={onClick}
        className="sector-card bg-radar-card rounded-xl p-4 cursor-pointer min-w-[220px] hover:bg-radar-card/80 transition-all border border-transparent hover:border-radar-accent/30"
      >
        {/* 头部：图标和温度 */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-3xl">{sector.icon}</span>
          <span className={`tag ${temp.class} px-2 py-1 text-xs rounded font-bold`}>{temp.label}</span>
        </div>
        
        {/* 板块名称 */}
        <h3 className="font-display font-bold text-white text-lg mb-0.5">
          {sector.name}
        </h3>
        <p className="text-xs text-radar-muted mb-4 font-mono opacity-70">
          {sector.nameEn}
        </p>
        
        {/* ETF 数据 (修正版) */}
        <div className="space-y-3 mb-4">
          {sector.etfs.map(etf => {
            const data = etfData[etf.symbol];
            // 优先显示日涨跌 (Day Change)
            const change = data?.dayChangePercent;
            const changeClass = change > 0 ? 'text-radar-up' : change < 0 ? 'text-radar-down' : 'text-radar-muted';
            
            return (
              <div key={etf.symbol} className="flex items-center justify-between text-sm">
                <div className="flex flex-col">
                    <span className="font-mono font-bold text-white">{etf.symbol}</span>
                    {/* 显示 ETF 中文名 (如果有) */}
                    <span className="text-[10px] text-radar-muted">{data?.nameCN || etf.name || ''}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-white font-medium font-mono text-base">
                    {formatPrice(data?.price)}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-radar-muted">日</span>
                    <span className={`font-mono text-xs font-bold ${changeClass}`}>
                        {formatPercent(change)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* 底部信息 */}
        <div className="pt-3 border-t border-radar-border/50 flex justify-between text-xs items-center">
           <span className="text-radar-muted">精选标的</span>
           <span className="bg-radar-bg px-2 py-0.5 rounded text-white font-mono">{stockCount}</span>
        </div>
      </div>
      
      {/* 连接线 (保持不变) */}
      {!isLast && (
        <div className="hidden lg:flex items-center mx-3">
          <div className="w-8 h-[2px] bg-gradient-to-r from-radar-border to-transparent"></div>
          <svg className="w-3 h-3 text-radar-border -ml-1" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
          </svg>
        </div>
      )}
    </div>
  );
};

export default SectorCard;
