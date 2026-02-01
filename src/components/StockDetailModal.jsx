import React, { useEffect, useState } from 'react';

const StockDetailModal = ({ symbol, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch(`/api/detail?symbol=${symbol}`);
        const json = await res.json();
        if (!json.error) {
          setData(json);
        } else {
          setError(true);
          setData(json); // 仍然保留部分数据
        }
      } catch (e) {
        console.error(e);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [symbol]);

  // 点击背景关闭
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end md:items-center justify-center animate-fade-in"
      onClick={handleBackdropClick}
    >
      {/* 背景遮罩 - 毛玻璃效果 */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md"></div>

      {/* 卡片主体 - 手机端从底部滑入 */}
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f] md:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden animate-slide-up border border-white/10">

        {/* 顶部拖拽指示条 (手机端) */}
        <div className="md:hidden flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-white/20"></div>
        </div>

        {/* 顶部装饰渐变条 */}
        <div className="h-1 w-full bg-gradient-to-r from-radar-accent via-orange-500 to-yellow-500"></div>

        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 md:top-5 md:right-5 p-2.5 bg-white/5 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-all z-20 backdrop-blur-sm border border-white/5"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="p-5 md:p-8 max-h-[85vh] overflow-y-auto">
          {loading ? (
            // 加载骨架屏 - 更精致的动画
            <div className="space-y-5 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="h-12 w-24 bg-white/10 rounded-xl"></div>
                <div className="h-6 w-16 bg-white/5 rounded-lg"></div>
              </div>
              <div className="h-5 w-32 bg-white/5 rounded"></div>
              <div className="h-10 w-28 bg-white/10 rounded-lg"></div>
              <div className="grid grid-cols-2 gap-3 mt-6">
                <div className="h-20 bg-white/5 rounded-xl"></div>
                <div className="h-20 bg-white/5 rounded-xl"></div>
                <div className="h-20 bg-white/5 rounded-xl"></div>
                <div className="h-20 bg-white/5 rounded-xl"></div>
              </div>
              <div className="h-28 bg-white/5 rounded-xl mt-6"></div>
            </div>
          ) : (
            <>
              {/* ===== 头部信息区域 ===== */}
              <div className="mb-6">
                {/* Symbol + 行业标签 */}
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-3xl md:text-4xl font-display font-bold text-white tracking-tight">
                    {data?.symbol || symbol}
                  </h2>
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/5 text-white/50 border border-white/5 uppercase tracking-wider">
                    {data?.sector || '—'}
                  </span>
                </div>

                {/* 公司名称 */}
                <h3 className="text-base md:text-lg text-white/70 font-medium mb-3">
                  {data?.name || symbol}
                </h3>

                {/* 当前价格 - 大字突出 */}
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl md:text-4xl font-mono font-bold text-white">
                    {data?.currency || '$'}{data?.currentPrice || '—'}
                  </span>
                </div>
              </div>

              {/* ===== 核心指标网格 ===== */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <StatBox
                  label="市值"
                  value={data?.marketCap}
                  icon={
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                />
                <StatBox
                  label="市盈率(PE)"
                  value={data?.peRatio}
                  icon={
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  }
                />
                <StatBox
                  label="股息率"
                  value={data?.dividendYield}
                  icon={
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  }
                />
                <StatBox
                  label="52周最高"
                  value={data?.high52 ? `$${data.high52}` : '—'}
                  icon={
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  }
                />
              </div>

              {/* ===== 公司简介 ===== */}
              <div className="mb-6">
                <h4 className="text-xs font-bold text-white/80 mb-3 flex items-center gap-2 uppercase tracking-wider">
                  <span className="w-1 h-4 bg-gradient-to-b from-radar-accent to-orange-500 rounded-full"></span>
                  公司简介
                </h4>
                <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
                  <p className="text-sm text-white/50 leading-relaxed">
                    {error
                      ? '数据加载受限，请稍后重试或直接访问 Yahoo Finance。'
                      : (data?.description || '暂无详细简介')
                    }
                  </p>
                </div>
              </div>

              {/* ===== 底部版权 ===== */}
              <div className="pt-4 border-t border-white/5">
                <p className="text-[10px] text-white/20 text-center font-mono">
                  数据源: Yahoo Finance via Vercel Edge · 延迟约15分钟
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// 小组件：指标盒子 - 升级版
const StatBox = ({ label, value, icon }) => (
  <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 hover:bg-white/[0.05] transition-colors group">
    <div className="flex items-center gap-2 mb-2">
      <div className="text-white/30 group-hover:text-white/50 transition-colors">
        {icon}
      </div>
      <div className="text-[10px] text-white/40 uppercase tracking-wider font-medium">{label}</div>
    </div>
    <div className="text-lg font-mono font-bold text-white">{value || '—'}</div>
  </div>
);

export default StockDetailModal;
