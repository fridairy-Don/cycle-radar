// 传导链板块配置
export const SECTORS = [
  {
    id: 'monetary',
    name: '货币/避险',
    nameEn: 'Monetary & Safe Haven',
    description: '货币宽松最先受益，避险资产领先',
    icon: '🛡️',
    color: '#fbbf24',
    etfs: [
      { symbol: 'GLD', name: 'SPDR黄金ETF' },
      { symbol: 'TLT', name: 'iShares 20年期国债ETF' }
    ]
  },
  {
    id: 'precious',
    name: '贵金属',
    nameEn: 'Precious Metals',
    description: '通胀预期升温，贵金属受益',
    icon: '💎',
    color: '#c0c0c0',
    etfs: [
      { symbol: 'SLV', name: 'iShares白银ETF' },
      { symbol: 'GDX', name: 'VanEck金矿ETF' }
    ]
  },
  {
    id: 'industrial',
    name: '工业金属',
    nameEn: 'Industrial Metals',
    description: '企业补库存，制造业复苏',
    icon: '⚙️',
    color: '#b45309',
    etfs: [
      { symbol: 'COPX', name: 'Global X铜矿ETF' },
      { symbol: 'XME', name: 'SPDR金属矿业ETF' }
    ]
  },
  {
    id: 'energy',
    name: '能源',
    nameEn: 'Energy',
    description: '需求端拉动，能源价格上涨',
    icon: '🔥',
    color: '#dc2626',
    etfs: [
      { symbol: 'XLE', name: 'SPDR能源板块ETF' },
      { symbol: 'USO', name: '美国原油ETF' }
    ]
  },
  {
    id: 'agriculture',
    name: '农业',
    nameEn: 'Agriculture',
    description: '成本传导末端，农产品补涨',
    icon: '🌾',
    color: '#16a34a',
    etfs: [
      { symbol: 'DBA', name: 'Invesco农产品ETF' },
      { symbol: 'MOO', name: 'VanEck农业ETF' }
    ]
  }
];

// 获取所有ETF符号列表
export const getAllETFSymbols = () => {
  return SECTORS.flatMap(sector => sector.etfs.map(etf => etf.symbol));
};

// 根据ID获取板块信息
export const getSectorById = (id) => {
  return SECTORS.find(sector => sector.id === id);
};
