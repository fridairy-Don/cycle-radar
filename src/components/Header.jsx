import React from 'react';

const Header = ({ onRefresh, loading }) => {
  return (
    <header className="border-b border-radar-border bg-radar-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo 和标题 */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-radar-accent to-orange-600 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                <circle cx="12" cy="12" r="3" fill="currentColor" />
                <line x1="12" y1="12" x2="12" y2="6" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-white tracking-tight">
                Cycle Radar
              </h1>
              <p className="text-xs text-radar-muted">
                周期传导链 · 股票仓库
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
              {loading ? '刷新中...' : '刷新数据'}
            </button>

            {/* 说明 */}
            <div className="hidden md:flex items-center gap-2 text-xs text-radar-muted">
              <span className="inline-block w-2 h-2 rounded-full bg-radar-hot"></span>
              <span>热</span>
              <span className="inline-block w-2 h-2 rounded-full bg-radar-warm"></span>
              <span>温</span>
              <span className="inline-block w-2 h-2 rounded-full bg-radar-cold"></span>
              <span>冷</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
