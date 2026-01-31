import React from 'react';

// === 辅助函数 ===
const getTemperature = (etfs, etfData) => {
  if (!etfs || etfs.length === 0) return { label: '—', class: 'text-radar-muted bg-radar-border/30' };
  
  const mainETF = etfs[0].symbol;
  const data = etfData[mainETF];

  if (!data || data.drawdown === undefined) return { label: '—', class: 'text-radar-muted bg-radar-border/30' };

  const dd = Math.abs(data.drawdown);

  // 优化后的冷热样式：使用小圆点+文字
  if (dd < 5) return { label: '热', class: 'text-orange-400 bg-orange-400/10 border-orange-400/20' }; 
  if (dd > 15) return { label: '冷', class: 'text-blue-400 bg-blue-400/10 border-blue-400/20' }; 
  return { label: '温', class: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' };
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
    <div className="relative flex items-center h-full">
      {/* === 卡片容器 ===
         w-[85vw]: 手机上宽度占屏幕 85%，露出一点下一张卡片
         md:w-[260px]: 电脑上固定宽度
      */}
      <div 
        onClick={onClick}
        className="
          w-[88vw] md:w-[280px] 
          bg-radar-card/80 backdrop-blur-md 
          rounded-2xl p-5 
          cursor-pointer 
          border border-radar-border/50 hover:border-radar-accent/50 
          transition-all duration-300 shadow-xl
          group relative overflow-hidden
        "
      >
        {/* 顶部发光背景特效 */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-radar-accent/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

        {/* 头部：图标和温度 */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl filter drop-shadow-md">{sector.icon}</span>
            <div>
              <h3 className="font-display font-bold text-white text-lg leading-tight">
                {sector.name}
              </h3>
              <p className="text-[10px] text-radar-muted font-mono uppercase tracking-wider">
                {sector.nameEn}
              </p>
            </div>
          </div>
          <span className={`text-xs px-2 py-1 rounded-md border font-medium ${temp.class}`}>
            {temp.label}
          </span>
        </div>
        
        {/* ETF 数据核心区域 */}
        <div className="space-y-3 mb-5">
          {sector.etfs.map(etf => {
            const data = etfData[etf.symbol];
            const change = data?.dayChangePercent;
            // 颜色逻辑
            const changeColor = change > 0 ? 'text-radar-up' : change < 0 ? 'text-radar-down' : 'text-radar-muted';
            const bgHover = change > 0 ? 'group-hover:bg-radar-up/5' : change < 0 ? 'group-hover:bg-radar-down/5' : '';
            
            return (
              <div key={etf.symbol} className={`flex items-center justify-between p-2 -mx-2 rounded-lg transition-colors ${bgHover}`}>
                {/* 左侧：代码和名称 */}
                <div className="flex flex-col">
                    <div className="flex items-baseline gap-1.5">
                        <span className="font-mono font-bold text-white text-sm">{etf.symbol}</span>
                        <span className="text-[10px] text-radar-muted scale-90 origin-bottom-left">
                            {data?.nameCN || etf.name}
                        </span>
                    </div>
                </div>

                {/* 右侧：价格和涨跌 */}
                <div className="flex flex-col items-end">
                  <span className="text-white font-medium font-mono text-sm tracking-tight">
                    {formatPrice(data?.price)}
                  </span>
                  <div className={`font-mono text-xs font-bold ${changeColor}`}>
                     {formatPercent(change)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* 底部信息栏 */}
        <div className="pt-3 border-t border-radar-border/30 flex justify-between items-center">
           <div className="flex items-center gap-1.5 text-xs text-radar-muted group-hover:text-white transition-colors">
             <span>查看标的池</span>
             <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
             </svg>
           </div>
           <span className="bg-white/5 px-2 py-0.5 rounded text-[10px] text-radar-muted font-mono border border-white/5 group-hover:border-radar-accent/30 transition-colors">
             {stockCount}
           </span>
        </div>
      </div>
      
      {/* 箭头连接线 (仅桌面显示，手机上滑动不需要箭头) */}
      {!isLast && (
        <div className="hidden md:flex items-center mx-2 text-radar-border/50">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </div>
      )}
    </div>
  );
};

export default SectorCard;
