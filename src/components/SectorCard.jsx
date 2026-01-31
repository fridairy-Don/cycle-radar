import React from 'react';

// 获取温度标签
const getTemperature = (monthChange) => {
  if (monthChange === null || monthChange === undefined) return { label: '—', class: 'tag-warm', temp: 'neutral' };
  if (monthChange > 5) return { label: '热', class: 'tag-hot', temp: 'hot' };
  if (monthChange > 0) return { label: '温', class: 'tag-warm', temp: 'warm' };
  return { label: '冷', class: 'tag-cold', temp: 'cold' };
};

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

const SectorCard = ({ sector, etfData, stockCount, onClick, isLast }) => {
  // 计算板块整体表现（基于ETF的平均月涨跌）
  const etfPerformances = sector.etfs.map(etf => etfData[etf.symbol]?.monthChangePercent).filter(v => v !== null && v !== undefined);
  const avgMonthChange = etfPerformances.length > 0 
    ? etfPerformances.reduce((a, b) => a + b, 0) / etfPerformances.length 
    : null;
  
  const temp = getTemperature(avgMonthChange);
  
  return (
    <div className="relative flex items-center">
      {/* 卡片主体 */}
      <div 
        onClick={onClick}
        className="sector-card bg-radar-card rounded-xl p-4 cursor-pointer min-w-[200px] hover:bg-radar-card/80"
      >
        {/* 头部：图标和温度 */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl">{sector.icon}</span>
          <span className={`tag ${temp.class}`}>{temp.label}</span>
        </div>
        
        {/* 板块名称 */}
        <h3 className="font-display font-bold text-white text-lg mb-1">
          {sector.name}
        </h3>
        <p className="text-xs text-radar-muted mb-3">
          {sector.nameEn}
        </p>
        
        {/* ETF 数据 */}
        <div className="space-y-2 mb-3">
          {sector.etfs.map(etf => {
            const data = etfData[etf.symbol];
            const monthChange = data?.monthChangePercent;
            const changeClass = monthChange > 0 ? 'price-up' : monthChange < 0 ? 'price-down' : 'text-radar-muted';
            
            return (
              <div key={etf.symbol} className="flex items-center justify-between text-sm">
                <span className="font-mono text-radar-muted">{etf.symbol}</span>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">
                    {formatPrice(data?.price)}
                  </span>
                  <span className={`font-mono text-xs ${changeClass}`}>
                    {formatPercent(monthChange)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* 股票池数量 */}
        <div className="pt-3 border-t border-radar-border">
          <div className="flex items-center justify-between text-xs">
            <span className="text-radar-muted">股票池</span>
            <span className="text-white font-medium">{stockCount} 只</span>
          </div>
        </div>
      </div>
      
      {/* 连接线 */}
      {!isLast && (
        <div className="hidden lg:flex items-center mx-2">
          <div className="w-8 h-[2px] bg-gradient-to-r from-radar-accent/50 to-radar-accent/20"></div>
          <svg className="w-3 h-3 text-radar-accent/50 -ml-1" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
          </svg>
        </div>
      )}
    </div>
  );
};

export default SectorCard;
