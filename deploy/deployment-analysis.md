# 产业链研究库 — 部署分析报告

> 从运维工程师视角分析 `industrial-chain-tracker` 项目的结构、依赖、部署方案。
> 分支: feat/deployment-analysis

> 本文保留早期方案分析。当前生产操作以
> `docs/production-deployment.md` 为准：镜像发布到腾讯云 CCR，容器端口仅绑定
> `127.0.0.1:4173`，不再使用固定容器 IP。

## 一、项目概览

| 项目 | 值 |
|------|----|
| 类型 | **内容 API + 静态阅读前端** |
| 后端 | Node.js 内置 HTTP 服务 |
| 构建步骤 | 无前端编译；内容更新后运行 `npm run sync` |
| 运行时依赖 | Node.js 22 |
| 文件数量 | 117 个 |
| 总大小 | **51MB**（其中 diagram/ 21MB, cover-image/ 6.9MB, 其他 316KB）|
| 入口文件 | `index.html` |
| 数据源 | `assets/data.js`（JSON 配置，引用相对路径）|

## 二、目录结构分析

```
industrial-chain-tracker/
├── index.html                 ← 主页面
├── assets/
│   ├── app.js                 ← 应用逻辑
│   ├── data.js                ← 产业链配置数据（JSON）
│   ├── bootstrap.js           ← API 优先、静态数据回退
│   └── styles.css             ← 样式
├── server/
│   ├── server.mjs             ← 静态服务、API 与路由
│   ├── auth.mjs               ← 维护密码和签名会话
│   └── library.mjs            ← 数据读取与服务端搜索
├── content/
│   ├── raw/                   ← 18个产业链原始文章（Markdown）
│   └── updates/               ← 18个产业链动态追踪数据（JSON）
├── diagram/                   ← 18个产业链图（SVG + PNG）
├── cover-image/               ← 18个微信封面图（SVG + PNG）
├── scripts/
│   └── sync-blog-data.mjs    ← 数据同步脚本（Node.js，开发工具）
├── deploy/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── deploy.sh
│   └── deployment-analysis.md
├── README.md
└── .gitignore
```

### 路径引用关系（已对齐）

目录结构调整后，所有相对路径与文件实际位置一致：

```
index.html（/）
├── ./assets/styles.css    → /assets/styles.css    ✅ 实际在 repo 根 assets/
├── ./assets/app.js        → /assets/app.js        ✅
└── ./README.md            → /README.md            ✅ 实际在 repo 根

data.js 中的路径：
├── ./content/raw/xxx      → /content/raw/xxx      ✅
├── ./diagram/xxx          → /diagram/xxx          ✅
├── ./cover-image/xxx      → /cover-image/xxx      ✅
└── ./content/updates/xxx  → /content/updates/xxx  ✅
```

## 三、部署方案对比

### 方案A：Docker 部署（推荐 ⭐）

以 `node:22-alpine` 为基础镜像，统一提供公开页面、内容 API 和受保护的维护台。外层 Nginx 只负责域名、HTTPS 和反向代理。

**结构：**
```
deploy/
├── Dockerfile        ← Node 22 运行镜像
├── nginx.conf        ← 外层反向代理示例
└── deploy.sh         ← 带环境变量检查的一键部署
```

**容器内部署结构：**
```
/app/                     ← 应用根目录
├── index.html            ← 首页
├── assets/               ← CSS/JS/数据
├── diagram/              ← 产业链图
├── content/              ← 源数据
├── cover-image/          ← 封面
└── README.md
```

**一键运行：**
```bash
# 从腾讯云 CCR 拉取指定版本并绑定到本机回环地址
bash deploy/deploy.sh
```

**验证：**
```bash
curl http://localhost:4173/
curl http://localhost:4173/api/v1/health
curl "http://localhost:4173/api/v1/chains/pcb?article=1"
```

**镜像大小：**
```
镜像包含 Node 运行时和研究资料，实际大小随产业链图片数量变化。
```

**更新流程：**
```bash
git pull --ff-only origin main
bash deploy/deploy.sh <Git短提交号>
```

**优点：**
- ✅ 纯 Docker，零宿主机依赖
- ✅ 环境完全隔离，和其他服务无关
- ✅ 后续项目改动只需重新构建镜像
- ✅ 可以推送到镜像仓库供其他机器拉取

### 方案B：Nginx 子路径（备选，不推荐）

在现有 3L 的 nginx 配置上加 location。依赖宿主机 nginx。

### 方案C：Python HTTP 服务（不推荐）

额外系统服务，不如 nginx 直接服务。

## 四、治理建议

### 4.1 数据同步脚本

`scripts/sync-blog-data.mjs` 用于把各产业链的动态文件同步到 `data.js`。生产运行时由 Node 服务读取同步后的资料库。

### 4.2 大文件优化（可选）

| 目录 | 大小 | 说明 |
|------|------|------|
| `diagram/` | 21MB | SVG + PNG，可考虑只保留 SVG 减小体积 |
| `cover-image/` | 6.9MB | SVG + PNG，同上 |

当前图片体积对内容服务压力不大。如果想优化，可增加 WebP 和对象存储/CDN，而不是删除维护所需的 SVG/PNG 原稿。

### 4.3 内容更新流程

```
更新 content/raw/*.md 或 content/updates/*.json
  → 运行 scripts/sync-blog-data.mjs（更新 data.js）
  → 推送到 GitHub
  → 重新构建并启动容器，使 Node 服务载入新数据
```

### 4.4 Git 追踪建议

- `diagram/` 下的 SVG/PNG 建议保留在 git 中（它们是内容的一部分，不是构建产物）
- 同 `cover-image/`
- 如果担心 git 仓库膨胀，可考虑用 Git LFS 管理大文件
- 当前 51MB 属于可接受范围，无需立即处理

## 五、部署步骤

```bash
# Step 1: 确保仓库在服务器上
ls /home/ubuntu/industrial-chain-tracker/

# Step 2: 配置密码并一键部署
cp .env.example .env
# 编辑 .env
bash /home/ubuntu/industrial-chain-tracker/deploy/deploy.sh

# Step 3: 验证
curl http://127.0.0.1:4173/api/v1/health
curl http://127.0.0.1:4173/

# Step 4: 浏览器访问
# 通过外层 Nginx 配置的 HTTPS 域名访问
```
