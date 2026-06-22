# 产业链研究库

这个目录用于维护多个产业链的研究资料。每条产业链都按同一套结构沉淀：

1. 原始文章：保存长文源稿。
2. 微信公众号素材：保存 cover 图和正文产业链图。
3. 动态追踪数据：记录涨价、扩产、认证、订单、调研、财报等变化。
4. 统一内容 API：供网页、微信小程序、iOS 和 Android 共用。
5. 统一博客页面：在一个入口中切换查看不同产业链。

## 运行方式

项目现在由轻量 Node 服务统一提供静态页面、内容 API 和维护者登录：

```bash
cp .env.example .env
# 修改 .env 中的维护密码和会话密钥
set -a && source .env && set +a
npm start
```

本地开发也可以运行 `npm run dev`。生产环境不要使用其中的示例密码。

访问地址：

- 公开阅读：`http://127.0.0.1:4173/`
- API 健康检查：`http://127.0.0.1:4173/api/v1/health`
- 维护者登录：`http://127.0.0.1:4173/admin-login.html`

## 内容 API

首期 API 供网页版与微信小程序共用：

| 接口 | 用途 |
|---|---|
| `GET /api/v1/health` | 服务状态与产业链数量 |
| `GET /api/v1/library` | 完整产业链资料库 |
| `GET /api/v1/chains` | 产业链列表 |
| `GET /api/v1/chains/{id}` | 单条产业链 |
| `GET /api/v1/chains/{id}?article=1` | 单条产业链及 Markdown 正文 |
| `GET /api/v1/chains/{id}?article=html` | 单条产业链及已渲染正文 |
| `GET /api/v1/search?q=关键词` | 跨产业链搜索 |
| `POST /api/v1/admin/login` | 维护者登录 |
| `POST /api/v1/admin/logout` | 退出登录 |
| `GET /api/v1/admin/chains` | 获取维护台产业链列表 |
| `GET /api/v1/admin/chains/{id}` | 读取已建档产业链的 Markdown 原稿 |
| `PUT /api/v1/admin/chains/{id}` | 更新已建档产业链的 Markdown 原稿 |
| `POST /api/v1/admin/chains/{id}/updates` | 给已有产业链追加动态追踪 |
| `POST /api/v1/admin/chains/{id}/research-packages/inspect` | 检测标准研究包 |
| `POST /api/v1/admin/chains/{id}/research-packages` | 将检测通过的研究包入库 |

网页启动时优先读取 `/api/v1/library`，API 不可用时回退到 `assets/data.js`，因此本地纯静态预览仍可使用。

## 维护权限

公开阅读页不再显示维护入口。`maintain.html` 和 `README.md` 由服务端校验签名会话，未登录访问会跳转到 `admin-login.html`。

维护密码只允许通过环境变量配置：

```bash
ADMIN_PASSWORD=至少10位的随机密码
ADMIN_SESSION_SECRET=至少32位的随机会话密钥
```

不要把真实 `.env` 提交到 Git。新产业链首次建档仍通过完整制作流程完成，包括结构化
数据、封面、产业链图谱和公开页检查。维护台只负责更新已有产业链的 Markdown 原文，
追加动态追踪，以及检测和导入标准研究包。研究包规范见
`docs/research-package-spec.md`。维护内容写入 `DATA_DIR`；生产 Compose 使用命名卷
`industrial-chain-tracker-data`，重新发布容器不会覆盖这些内容。

内容状态可切换为腾讯云 MySQL；研究文件可使用本地数据卷或腾讯云 COS。配置、迁移
和回退说明见 `docs/storage-architecture.md`。

## 微信小程序与 App

移动端源码位于 `apps/mobile/`，采用 uni-app Vue 3/Vite：

```bash
cd apps/mobile
cp .env.example .env
npm install
npm run build:mp-weixin
```

首版覆盖产业链列表、搜索、图谱、骨架、核心逻辑、动态追踪和正文阅读。微信小程序发布前需要：

1. 在 `apps/mobile/src/manifest.json` 填写小程序 AppID。
2. 部署 HTTPS API 域名。
3. 在微信公众平台配置 request 合法域名。

产品与技术阶段安排见 `docs/mobile-roadmap.md`。

当前 uni-app 官方模板的 Node 构建依赖存在审计告警。不要运行会降级 DCloud 包的 `npm audit fix --force`；小程序上线前应升级到官方兼容版本并重新编译、审计。

统一的是入口和数据结构，不是追踪指标。每条产业链都要维护自己的专属动态追踪：PCB 重点看电子布、铜箔、CCL调价和PCB扩产；MLCC 重点看陶瓷粉体、电极浆料、离型膜、AI服务器用量和车规导入；智能驾驶重点看FSD入华、L3准入、高阶智驾渗透、感知硬件、域控制器、线控底盘和车路云招标；半导体总览重点看WSTS预测、存储周期、国产替代导入、先进封装和设备材料验证；半导体设备重点看晶圆厂CAPEX、前道设备订单、后道封测利润弹性、零部件/特气认证和量检测等低国产化环节突破；存储重点看HBM/DRAM/NAND价格、长鑫长存IPO与扩产、模组库存红利、封测和设备材料订单；光模块重点看800G/1.6T订单、CPO硅光量产、InP/EML/CW光芯片供需、薄膜铌酸锂和光纤光缆涨价；AI算力基础设施作为总图谱，重点看云厂CAPEX、AI服务器订单、光互联、液冷/HVDC和智算中心上架率；电力基础设施重点看国网/南网招标、特高压开工、智能配网、算电协同、AIDC供电订单和电力设备出海；AI能源供给侧重点看AIDC自建发电、燃气轮机/柴发交期、SOFC批量落地、精密铸件和HRSG产线；消费电子重点看AI手机/AIPC、折叠屏iPhone、AI眼镜、以旧换新和终端单机价值量提升；创新药重点看BD出海、CXO订单、盈利拐点、ADC/双抗临床数据和医保商保支付环境；商业航天重点看千帆/GW星座组网、可复用火箭、SpaceX IPO、航天ETF资金、核心零部件订单和亏损企业风险；储能重点看AI数据中心配储、全球装机与招标、锂电材料价格、电芯/PCS订单和系统集成盈利；脑机接口重点看临床试验/注册审批、侵入式电极材料、BCI专用芯片、康复商业化和强脑科技等一级市场进展。

## 统一博客入口

- 博客首页：`index.html`
- 博客数据：`assets/data.js`
- 博客样式：`assets/styles.css`
- 博客脚本：`assets/app.js`

直接打开 `index.html`，即可在页面里切换 PCB、MLCC、光刻机、光刻胶、机器人、智能驾驶、半导体、半导体设备、半导体材料、存储、光模块、AI算力基础设施、电力基础设施、AI能源供给侧、消费电子、创新药、商业航天、储能和脑机接口等产业链。

## 当前已建档产业链

### PCB产业链

- 原始文章：`content/raw/pcb-industry-chain-original.md`
- 动态数据：`content/updates/pcb-chain-updates.json`
- 公众号封面：`cover-image/pcb-industry-chain/pcb-industry-chain-cover.png`
- 产业链图：`diagram/pcb-industry-chain/pcb-industry-chain-map@2x.png`

### MLCC产业链

- 原始文章：`content/raw/mlcc-industry-chain-original.md`
- 动态数据：`content/updates/mlcc-chain-updates.json`
- 公众号封面：`cover-image/mlcc-industry-chain/mlcc-industry-chain-cover.png`
- 产业链图：`diagram/mlcc-industry-chain/mlcc-industry-chain-map@2x.png`

### 光刻机产业链

- 原始文章：`content/raw/lithography-industry-chain-original.md`
- 动态数据：`content/updates/lithography-chain-updates.json`
- 公众号封面：`cover-image/lithography-industry-chain/lithography-industry-chain-cover.png`
- 产业链图：`diagram/lithography-industry-chain/lithography-industry-chain-map@2x.png`

### 光刻胶产业链

- 原始文章：`content/raw/photoresist-industry-chain-original.md`
- 动态数据：`content/updates/photoresist-chain-updates.json`
- 公众号封面：`cover-image/photoresist-industry-chain/photoresist-industry-chain-cover.png`
- 产业链图：`diagram/photoresist-industry-chain/photoresist-industry-chain-map@2x.png`

### 机器人产业链

- 原始文章：`content/raw/robotics-industry-chain-original.md`
- 动态数据：`content/updates/robotics-chain-updates.json`
- 公众号封面：`cover-image/robotics-industry-chain/robotics-industry-chain-cover.png`
- 产业链图：`diagram/robotics-industry-chain/robotics-industry-chain-map@2x.png`

### 智能驾驶产业链

- 原始文章：`content/raw/intelligent-driving-industry-chain-original.md`
- 动态数据：`content/updates/intelligent-driving-chain-updates.json`
- 公众号封面：`cover-image/intelligent-driving-industry-chain/intelligent-driving-industry-chain-cover.png`
- 产业链图：`diagram/intelligent-driving-industry-chain/intelligent-driving-industry-chain-map@2x.png`

### 半导体产业链

- 原始文章：`content/raw/semiconductor-industry-chain-original.md`
- 动态数据：`content/updates/semiconductor-chain-updates.json`
- 公众号封面：`cover-image/semiconductor-industry-chain/semiconductor-industry-chain-cover.png`
- 产业链图：`diagram/semiconductor-industry-chain/semiconductor-industry-chain-map@2x.png`

### 半导体设备产业链

- 原始文章：`content/raw/semiconductor-equipment-industry-chain-original.md`
- 动态数据：`content/updates/semiconductor-equipment-chain-updates.json`
- 公众号封面：`cover-image/semiconductor-equipment-industry-chain/semiconductor-equipment-industry-chain-cover.png`
- 产业链图：`diagram/semiconductor-equipment-industry-chain/semiconductor-equipment-industry-chain-map@2x.png`

### 存储产业链

- 原始文章：`content/raw/storage-industry-chain-original.md`
- 动态数据：`content/updates/storage-chain-updates.json`
- 公众号封面：`cover-image/storage-industry-chain/storage-industry-chain-cover.png`
- 产业链图：`diagram/storage-industry-chain/storage-industry-chain-map@2x.png`

### 光模块产业链

- 原始文章：`content/raw/optical-module-industry-chain-original.md`
- 动态数据：`content/updates/optical-module-chain-updates.json`
- 公众号封面：`cover-image/optical-module-industry-chain/optical-module-industry-chain-cover.png`
- 产业链图：`diagram/optical-module-industry-chain/optical-module-industry-chain-map@2x.png`

### AI算力基础设施产业链

- 原始文章：`content/raw/ai-compute-infrastructure-industry-chain-original.md`
- 动态数据：`content/updates/ai-compute-infrastructure-chain-updates.json`
- 公众号封面：`cover-image/ai-compute-infrastructure-industry-chain/ai-compute-infrastructure-industry-chain-cover.png`
- 产业链图：`diagram/ai-compute-infrastructure-industry-chain/ai-compute-infrastructure-industry-chain-map@2x.png`

### 电力基础设施产业链

- 原始文章：`content/raw/power-infrastructure-industry-chain-original.md`
- 动态数据：`content/updates/power-infrastructure-chain-updates.json`
- 公众号封面：`cover-image/power-infrastructure-industry-chain/power-infrastructure-industry-chain-cover.png`
- 产业链图：`diagram/power-infrastructure-industry-chain/power-infrastructure-industry-chain-map@2x.png`

### AI算力能源供给侧产业链

- 原始文章：`content/raw/ai-energy-supply-industry-chain-original.md`
- 动态数据：`content/updates/ai-energy-supply-chain-updates.json`
- 公众号封面：`cover-image/ai-energy-supply-industry-chain/ai-energy-supply-industry-chain-cover.png`
- 产业链图：`diagram/ai-energy-supply-industry-chain/ai-energy-supply-industry-chain-map@2x.png`

### 消费电子产业链

- 原始文章：`content/raw/consumer-electronics-industry-chain-original.md`
- 动态数据：`content/updates/consumer-electronics-chain-updates.json`
- 公众号封面：`cover-image/consumer-electronics-industry-chain/consumer-electronics-industry-chain-cover.png`
- 产业链图：`diagram/consumer-electronics-industry-chain/consumer-electronics-industry-chain-map@2x.png`

### 创新药产业链

- 原始文章：`content/raw/innovative-drug-industry-chain-original.md`
- 动态数据：`content/updates/innovative-drug-chain-updates.json`
- 公众号封面：`cover-image/innovative-drug-industry-chain/innovative-drug-industry-chain-cover.png`
- 产业链图：`diagram/innovative-drug-industry-chain/innovative-drug-industry-chain-map@2x.png`

### 商业航天产业链

- 原始文章：`content/raw/commercial-space-industry-chain-original.md`
- 动态数据：`content/updates/commercial-space-chain-updates.json`
- 公众号封面：`cover-image/commercial-space-industry-chain/commercial-space-industry-chain-cover.png`
- 产业链图：`diagram/commercial-space-industry-chain/commercial-space-industry-chain-map@2x.png`

### 储能产业链

- 原始文章：`content/raw/energy-storage-industry-chain-original.md`
- 动态数据：`content/updates/energy-storage-chain-updates.json`
- 公众号封面：`cover-image/energy-storage-industry-chain/energy-storage-industry-chain-cover.png`
- 产业链图：`diagram/energy-storage-industry-chain/energy-storage-industry-chain-map@2x.png`

### 脑机接口产业链

- 原始文章：`content/raw/brain-computer-interface-industry-chain-original.md`
- 动态数据：`content/updates/brain-computer-interface-chain-updates.json`
- 公众号封面：`cover-image/brain-computer-interface-industry-chain/brain-computer-interface-industry-chain-cover.png`
- 产业链图：`diagram/brain-computer-interface-industry-chain/brain-computer-interface-industry-chain-map@2x.png`

## 更新动态的方法

看到新的产业链线索后，把它追加到对应 `content/updates/*-chain-updates.json` 的 `updates` 数组里：

```json
{
  "date": "YYYY-MM-DD",
  "segment": "上游 / 中游 / 下游 / 具体环节",
  "signal": "一句话描述新变化",
  "impact": "它如何改变产业链逻辑",
  "confidence": "待核验 / 已核验 / 高置信",
  "source": {
    "type": "公告 / 调研 / 视频 / 研报 / 财报",
    "platform": "来源平台",
    "title": "来源标题",
    "url": "来源链接"
  },
  "notes": "待验证问题、关键口径、后续跟踪点"
}
```

然后运行同步脚本，刷新博客页面数据：

```bash
npm run sync
```

同步后建议再运行校验脚本，确认页面数据引用的文章、图片、动态文件都存在，动态数据结构也能被页面消费：

```bash
npm run validate
```

## 新增一条产业链的方法

1. 保存原始文章到 `content/raw/{slug}-industry-chain-original.md`。
2. 保存动态追踪数据到 `content/updates/{slug}-chain-updates.json`。
3. 生成公众号封面到 `cover-image/{slug}-industry-chain/`。
4. 生成产业链图到 `diagram/{slug}-industry-chain/`。
5. 在 `assets/data.js` 的 `chains` 数组里新增一条产业链配置。
6. 运行 `npm run sync`，同步动态数据。
7. 运行 `npm run validate`，确认页面数据和文件引用完整。

## 建议追踪字段

- 价格：涨价函、报价、ASP、加工费。
- 产能：点火、投产、达产、稼动率、交期。
- 认证：客户验证、车规认证、海外导入、替代进度。
- 订单：AI服务器、新能源车、通信、军工等终端订单变化。
- 财报：收入、毛利率、扣非净利、资本开支。
- 风险：估值、需求、供给释放、技术路线、竞争格局。
