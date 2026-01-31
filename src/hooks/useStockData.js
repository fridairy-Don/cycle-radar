import { useState, useEffect, useCallback } from 'react';

// === 1. 2026 核心资产中文映射表 ===
const NAME_MAP = {
  // --- 货币/避险 (Crypto & Safe Haven) ---
  'MSTR': '微策(BTC杠杆)', 'COIN': 'Coinbase', 'HOOD': '罗宾汉',
  'MARA': 'Marathon矿业', 'RIOT': 'Riot矿业', 'CLSK': 'CleanSpark',
  'IBIT': '贝莱德BTC', 'GBTC': '灰度BTC', 'BITF': 'Bitfarms',
  'TLT': '20年美债', 'IEF': '10年美债', 'SHY': '短债现金',
  'JPM': '摩根大通', 'GS': '高盛', 'BLK': '贝莱德',
  
  // --- 贵金属 (Precious Metals) ---
  'GLD': '黄金ETF', 'IAU': '黄金信托', 'SLV': '白银ETF',
  'GDX': '金矿ETF', 'GDXJ': '小金矿ETF',
  'NEM': '纽蒙特矿业', 'GOLD': '巴里克黄金', 'AEM': '伊格尔矿业',
  'FNV': 'Franco-NV', 'WPM': '惠顿贵金属',
  'PAAS': '泛美白银', 'AG': '第一威银', 'HL': '赫克拉矿业',
  'CDE': '科尔黛伦', 'SIL': '白银矿业ETF',

  // --- 工业金属 (Industrial / AI Infra) ---
  'COPX': '铜矿ETF', 'FCX': '自由港铜', 'SCCO': '南方铜业', 'TECK': '泰克资源',
  'BHP': '必和必拓', 'RIO': '力拓', 'VALE': '淡水河谷',
  'AA': '美国铝业', 'CENX': '世纪铝业', 'KALU': '凯撒铝业',
  'X': '美国钢铁', 'NUE': '纽克钢铁', 'STLD': '动力钢铁', 'CLF': '克利夫兰',
  'ALB': '雅保锂业', 'SQM': '智利矿业',

  // --- 能源 (Energy / Geopolitics) ---
  'XLE': '能源ETF', 'USO': '原油基金', 'UNG': '天然气',
  'XOM': '埃克森美孚', 'CVX': '雪佛龙', 'COP': '康菲石油',
  'OXY': '西方石油', 'EOG': 'EOG资源', 'PXD': '先锋自然',
  'DVN': '戴文能源', 'HES': '赫斯',
  'SLB': '斯伦贝谢', 'HAL': '哈里伯顿', 'BKR': '贝克休斯',
  'MPC': '马拉松炼油', 'VLO': '瓦莱罗',

  // --- 农业 (Agriculture / Food Security) ---
  'DBA': '农产品ETF', 'MOO': '农业股ETF',
  'DE': '约翰迪尔', 'CAT': '卡特彼勒', 'AGCO': '爱科农机', 'CNHI': '凯斯纽荷兰',
  'ADM': 'ADM粮商', 'BG': '邦吉', 'ANDE': '安德森',
  'NTR': 'Nutrien化肥', 'MOS': '美盛化肥', 'CF': 'CF工业', 'ICL': '以色列化工',
  'TSN': '泰森食品', 'FMC': 'FMC农化'
};

// === 2. 强制刷新版本号 (升级到 v3) ===
const STORAGE_VERSION = 'v3_full_list'; 

// === 3. 数据 Hook ===
export const useStockData = (symbols) => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!symbols || symbols.length === 0) {
      setLoading(false);
      return;
    }
    
    if (Object.keys(data).length === 0) setLoading(true);
    
    try {
      const newData = {};
      const promises = symbols.map(async (symbol) => {
        try {
          const res = await fetch(`/api/stock?symbol=${symbol}`);
          const json = await res.json();
          if (json.error) return;
          
          json.nameCN = NAME_MAP[symbol] || json.shortName || symbol;
          newData[symbol] = json;
        } catch (e) {
          console.error(e);
        }
      });
      await Promise.all(promises);
      setData(prev => ({ ...prev, ...newData }));
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(symbols)]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  return { data, loading, refresh };
};

// === 4. 豪华版默认股票池 (15只/板块) ===
const DEFAULT_STOCKS = {
  monetary: [
    'MSTR', 'COIN', 'MARA', 'RIOT', 'CLSK', // 币圈先锋
    'IBIT', 'GBTC', 'HOOD',                 // 渠道与ETF
    'TLT', 'IEF', 'SHY',                    // 利率锚
    'JPM', 'GS', 'BLK'                      // 传统金融
  ],
  precious: [
    'GLD', 'SLV', 'IAU',                    // 现货ETF
    'GDX', 'GDXJ',                          // 矿业ETF
    'NEM', 'GOLD', 'AEM', 'FNV', 'WPM',     // 黄金巨头
    'PAAS', 'AG', 'HL', 'CDE', 'SIL'        // 白银与高弹性
  ],
  industrial: [
    'COPX', 'FCX', 'SCCO', 'TECK',          // 铜 (AI电力)
    'BHP', 'RIO', 'VALE',                   // 全球资源
    'AA', 'CENX',                           // 铝
    'X', 'NUE', 'CLF',                      // 钢铁基建
    'ALB', 'SQM'                            // 锂
  ],
  energy: [
    'XLE', 'USO',                           // 行业ETF
    'XOM', 'CVX', 'COP', 'OXY',             // 石油巨头
    'EOG', 'DVN', 'PXD',                    // 页岩油
    'SLB', 'HAL', 'BKR',                    // 油服
    'MPC', 'VLO'                            // 炼化
  ],
  agriculture: [
    'DBA', 'MOO',                           // 行业ETF
    'DE', 'CAT', 'AGCO',                    // 农机
    'ADM', 'BG', 'ANDE',                    // 粮商
    'NTR', 'MOS', 'CF', 'ICL',              // 化肥
    'TSN', 'FMC'                            // 食品与农药
  ]
};

export const useWatchlist = () => {
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const savedVersion = localStorage.getItem('radar_version');
      const savedData = localStorage.getItem('cycle-radar-watchlist');
      
      if (savedVersion !== STORAGE_VERSION) {
        localStorage.setItem('radar_version', STORAGE_VERSION);
        localStorage.setItem('cycle-radar-watchlist', JSON.stringify(DEFAULT_STOCKS));
        return DEFAULT_STOCKS;
      }
      return savedData ? JSON.parse(savedData) : DEFAULT_STOCKS;
    } catch {
      return DEFAULT_STOCKS;
    }
  });

  useEffect(() => {
    localStorage.setItem('cycle-radar-watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  const addStock = useCallback((sectorId, symbol) => {
    const upperSymbol = symbol.toUpperCase().trim();
    if (!upperSymbol) return false;
    setWatchlist(prev => {
      if (prev[sectorId]?.includes(upperSymbol)) return prev;
      return { ...prev, [sectorId]: [...(prev[sectorId] || []), upperSymbol] };
    });
    return true;
  }, []);

  const removeStock = useCallback((sectorId, symbol) => {
    setWatchlist(prev => ({
      ...prev,
      [sectorId]: prev[sectorId]?.filter(s => s !== symbol) || []
    }));
  }, []);

  const getStocksForSector = useCallback((sectorId) => {
    return watchlist[sectorId] || [];
  }, [watchlist]);

  const getAllStocks = useCallback(() => {
    const all = Object.values(watchlist).flat();
    return [...new Set(all)];
  }, [watchlist]);

  return { watchlist, addStock, removeStock, getStocksForSector, getAllStocks };
};

export default useStockData;
