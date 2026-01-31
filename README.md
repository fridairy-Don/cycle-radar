# Cycle Radar 周期雷达

基于商品传导链的个人优质股票仓库。

## 核心理念

不预测周期，只帮你准备好。

## 传导链逻辑

```
货币/避险 → 贵金属 → 工业金属 → 能源 → 农业
```

货币宽松先推金融资产，然后是工业金属，再到能源，最后传导到农产品。

## 功能特点

- 📊 **传导链可视化**：5个板块横向排列，一眼看清周期位置
- 🎯 **锚定ETF**：每个板块显示2个代表性ETF的实时数据
- 📦 **个人股票池**：在每个板块下建立自己的优质股票库
- 🔍 **回撤筛选**：快速找出跌幅较大的潜在机会
- 📈 **多维数据**：日/周/月涨跌、52周高点回撤
- 🔗 **快速跳转**：一键打开Yahoo Finance查看详情

## 部署到Vercel

### 方式一：直接部署（推荐）

1. Fork 或 Push 这个项目到你的 GitHub
2. 登录 [Vercel](https://vercel.com)（用GitHub账号登录）
3. 点击 "New Project"
4. 选择你的 cycle-radar 仓库
5. 点击 "Deploy"
6. 完成！你会得到一个 xxx.vercel.app 的网址

### 方式二：本地开发

```bash
# 安装依赖
npm install

# 本地开发
npm run dev

# 构建生产版本
npm run build
```

## 技术栈

- React 18
- Vite
- Tailwind CSS
- Yahoo Finance API

## 数据说明

- 数据来源：Yahoo Finance
- 更新频率：每5分钟自动刷新
- 延迟：约15分钟

## 免责声明

本工具仅供学习和参考使用，不构成任何投资建议。投资有风险，决策需谨慎。

---

Made with ☕ by Claude
