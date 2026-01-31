import React from 'react';

const Header = ({ onRefresh, loading, onGoHome }) => {
  return (
    <header className="border-b border-radar-border bg-radar-card/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo 和标题 - 增加点击返回首页功能 */}
          <div 
            onClick={onGoHome} // <--- 关键修改：点击触发回家
            className="flex items-center gap-4 cursor-pointer active:scale-95 transition-transform group"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-radar-accent to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/40 transition-shadow">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                <circle cx="12" cy="12" r="3" fill="currentColor" />
                <line x1="12" y1="12" x2="12" y2="6" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-white tracking-tight leading-none mb-0.5">
                Cycle Radar
              </h1>
              <p className="text-[10px] text-radar-muted uppercase tracking-wider font-mono">
                Global Macro V3
              </p>
            </div>
          </div>

          {/* 右侧操作 */}
          <div className="flex items-center gap-4">
            {/* 刷新按钮 */}
            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-radar-card border border-radar-border hover:border-radar-accent/50 transition-all text-sm text-radar-muted hover:text-white disabled:opacity-50"
            >
              <svg 
                className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M21 3v5h-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="hidden md:inline">{loading ? '更新中...' : '刷新'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
