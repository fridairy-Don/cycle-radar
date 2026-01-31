import React, { useEffect, useState } from 'react';

const StockDetailModal = ({ symbol, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 加载数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/detail?symbol=${symbol}`);
        const json = await res.json();
        if (!json.error) setData(json);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [symbol]);

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4 animate-fade-in">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* 卡片主体 */}
      <div className="relative w-full max-w-lg bg-[#151515] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        
        {/* 顶部装饰条 */}
        <div className="h-1.5 w-full bg-gradient-to-r from-radar-accent to-orange-500"></div>

        {/* 关闭按钮 */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors z-10"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>

        <div className="p-6 md:p-8 max-h-[80vh] overflow-y-auto">
          {loading ? (
            // 加载骨架屏
            <div className="space-y-4 animate-pulse">
              <div className="h-8 w-1/3 bg-white/10 rounded"></div>
              <div className="h-4 w-1/4 bg-white/5 rounded"></div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="h-20 bg-white/5 rounded"></div>
                <div className="h-20 bg-white/5 rounded"></div>
              </div>
              <div className="h-32 bg-white/5 rounded mt-6"></div>
            </div>
          ) : data ? (
            <>
              {/* 头部信息 */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-3xl font-display font-bold text-white">{data.symbol}</h2>
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-white/10 text-radar-muted border border-white/5">
                    {data.sector}
                  </span>
                </div>
                <h3 className="text-lg text-white/80 font-medium">{data.name}</h3>
                <div className="text-2xl font-mono font-bold text-radar-accent mt-2">
                  {data.currency}{data.currentPrice}
                </div>
              </div>

              {/* 核心指标网格 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <StatBox label="市值" value={data.marketCap} />
                <StatBox label="市盈率(PE)" value={data.peRatio} />
                <StatBox label="股息率" value={data.dividendYield} />
                <StatBox label="52周最高" value={data.high52} />
              </div>

              {/* 公司简介 */}
              <div className="mb-4">
                <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <span className="w-1 h-4 bg-radar-accent rounded-full"></span>
                  公司简介
                </h4>
                <p className="text-sm text-radar-muted leading-relaxed text-justify bg-white/5 p-4 rounded-xl border border-white/5">
                  {data.description}
                </p>
              </div>

              {/* 底部版权 */}
              <div className="text-center mt-6">
                <p className="text-[10px] text-white/20">数据源: Yahoo Finance via Vercel Edge</p>
              </div>
            </>
          ) : (
            <div className="text-center py-10 text-radar-muted">加载失败，请重试</div>
          )}
        </div>
      </div>
    </div>
  );
};

// 小组件：指标盒子
const StatBox = ({ label, value }) => (
  <div className="bg-white/5 border border-white/5 rounded-lg p-3 text-center">
    <div className="text-[10px] text-radar-muted mb-1 uppercase tracking-wider">{label}</div>
    <div className="text-sm font-mono font-bold text-white">{value}</div>
  </div>
);

export default StockDetailModal;
