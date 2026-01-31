import React from 'react';

// === 辅助函数保持不变 ===
const getTemperature = (etfs, etfData) => {
  if (!etfs || etfs.length === 0) return { label: '—', class: 'text-radar-muted border-radar-border/30' };
  
  const mainETF = etfs[0].symbol;
  const data = etfData[mainETF];

  if (!data || data.drawdown === undefined) return { label: '—', class: 'text-radar-muted border-radar-border/30' };

  const dd = Math.abs(data.drawdown);

  // 高级感配色：用更深邃的颜色
  if (dd < 5) return { label: 'HOT', class: 'text-orange-400 border-orange-500/30 bg-orange-500/10 shadow-[0_0_10px_rgba(249,115,22,0.2)]' }; 
  if (dd > 15) return { label: 'COLD', class: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' }; 
  return { label: 'NEUTRAL', class: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' };
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
    <div className="relative flex items-center h-full py-2">
      <div 
        onClick={onClick}
        className="
          w-[85vw] md:w-[300px] 
          /* === 核心美化：黑金玻璃质感 === */
          bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D]
          backdrop-blur-xl
          rounded-2xl p-5 
          cursor-pointer 
          border border-white/5 hover:border-radar-accent/50 
          transition-all duration-300 
          shadow-xl hover:shadow-2xl hover:shadow-radar-accent/10
          group relative overflow-hidden
        "
      >
        {/* 背景极光特效 (提升科技感) */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-radar-accent/5 rounded-full blur-[50px] -mr-10 -mt-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-[40px] -ml-10 -mb-10 pointer-events-none"></div>

        {/* 头部 */}
        <div className="flex items-start justify-between mb-5 relative z-10">
          <div className="flex items-center gap-3">
            <span className="text-4xl filter drop-shadow-lg">{sector.icon}</span>
            <div>
              <h3 className="font-display font-bold text-white text-xl tracking-tight">
                {sector.name}
              </h3>
              <p className="text-[10px] text-radar-muted font-mono uppercase tracking-widest opacity-60">
                {sector.nameEn}
              </p>
            </div>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded border font-mono font-bold tracking-wider ${temp.class}`}>
            {temp.label}
          </span>
        </div>
        
        {/* ETF 数据区域 */}
        <div className="space-y-3 mb-6 relative z-10">
          {sector.etfs.map(etf => {
            const data = etfData[etf.symbol];
            const change = data?.dayChangePercent;
            const changeColor = change > 0 ? 'text-[#00FF9D]' : change < 0 ? 'text-[#FF4D4D]' : 'text-radar-muted'; // 荧光绿/红
            
            return (
              <div key={etf.symbol} className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-sm">{etf.symbol}</span>
                    </div>
                    <span className="text-[10px] text-radar-muted opacity-70">
                        {data?.nameCN || etf.name}
                    </span>
                </div>

                <div className="flex flex-col items-end">
                  <span className="text-white font-medium font-mono text-sm">
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
        <div className="pt-3 border-t border-white/5 flex justify-between items-center relative z-10">
           <div className="flex items-center gap-1.5 text-xs text-radar-muted/80 group-hover:text-white transition-colors">
             <span>进入板块</span>
             <svg className="w-3 h-3 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
             </svg>
           </div>
           <span className="bg-black/40 px-2 py-0.5 rounded text-[10px] text-radar-muted font-mono">
             {stockCount} 标的
           </span>
        </div>
      </div>
      
      {/* 桌面端连接箭头 */}
      {!isLast && (
        <div className="hidden md:flex items-center mx-3 text-radar-border/30">
          <svg className="w-6 h-6 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </div>
      )}
    </div>
  );
};

export default SectorCard;
