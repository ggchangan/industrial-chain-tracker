# 产业链研究库 — 部署分析报告

> 从运维工程师视角分析 `industrial-chain-tracker` 项目的结构、依赖、部署方案。
> 分支: feat/deployment-analysis

## 一、项目概览

| 项目 | 值 |
|------|----|
| 类型 | **纯静态网站**（HTML + CSS + JS + 资源文件）|
| 后端 | 无 |
| 构建步骤 | 无（`blog/` 下的 HTML/CSS/JS 直接可访问）|
| 运行时依赖 | 无（只需要一个 HTTP 服务器）|
| 文件数量 | 117 个 |
| 总大小 | **51MB**（其中 diagram/ 21MB, cover-image/ 6.9MB, 其他 316KB）|
| 入口文件 | `blog/index.html` |
| 数据源 | `blog/assets/data.js`（JSON 配置，引用相对路径）|

## 二、目录结构分析

```
industrial-chain-tracker/
├── blog/                     ← 网站根（入口 + 前端资源）
│   ├── index.html            ← 主页面
│   └── assets/
│       ├── app.js            ← 应用逻辑
│       ├── data.js           ← 产业链配置数据（JSON）
│       └── styles.css        ← 样式
├── content/
│   ├── raw/                  ← 18个产业链原始文章（Markdown）
│   └── updates/              ← 18个产业链动态追踪数据（JSON）
├── diagram/                  ← 18个产业链图（SVG + PNG）
├── cover-image/              ← 18个微信封面图（SVG + PNG）
├── scripts/
│   └── sync-blog-data.mjs    ← 数据同步脚本（Node.js，开发工具）
├── README.md                 ← 项目说明
└── .gitignore
```

### 路径引用关系（关键）

`data.js` 中所有资源路径都是**相对于 HTML 文件**的：

```js
// blog/assets/data.js
"article": "../content/raw/pcb-industry-chain-original.md",
"cover":   "../cover-image/pcb-industry-chain/pcb-industry-chain-cover.png",
"diagram": "../diagram/pcb-industry-chain/pcb-industry-chain-map@2x.png",
"updateFile": "../content/updates/pcb-chain-updates.json",
```

`index.html` 中 "查看维护说明" 按钮指向：
```html
<a class="button" href="../README.md">查看维护说明</a>
```

**这意味着：Web 服务的根目录必须指向仓库根目录（而非 `blog/`），否则所有相对路径会断裂。**

## 三、部署方案对比

### 方案A：Nginx 子路径（推荐 ⭐）

在现有 3L 项目的 nginx 配置中，加一个 `location /chain/`，别名到 repo 根目录。

**优点：**
- ✅ 零新增服务、零新增端口
- ✅ 复用现有 nginx + SSL 证书
- ✅ 一行配置，无需维护
- ✅ URL 统一：`https://43.136.177.133/chain/`

**原理：**
```
请求 /chain/
  → nginx alias 到 /home/ubuntu/industrial-chain-tracker/
  → 默认 index blog/index.html
  → HTML 中的 ./assets/... 解析为 /chain/blog/assets/... ✓
  → HTML 中的 ../README.md 解析为 /chain/README.md ✓
  → data.js 中的 ../diagram/... 解析为 /chain/diagram/... ✓
```

**nginx 配置：**
```nginx
location /chain/ {
    alias /home/ubuntu/industrial-chain-tracker/;
    index blog/index.html;
}
```

**部署操作：** 修改 nginx 配置 → 重载 → 完成

### 方案B：独立 Nginx 子域名

新增一个 server 块，绑定子域名（如 `chain.43.136.177.133`）。

**缺点：** ❌ 需要额外 SSL 证书、DNS 配置或自签名证书

### 方案C：Python HTTP 服务

用 `python3 -m http.server` 启动独立端口 + systemd 管理。

**缺点：** ❌ 增加系统服务量、需手动处理 404 回退、比 nginx 直接服务静态文件性能差

**不需要 Docker** — 静态网站用 Docker 是过度设计，nginx 直接服务更简单高效。

## 四、治理建议

### 4.1 数据同步脚本

`scripts/sync-blog-data.mjs` 用 Node.js 编写。生产环境中部署不需要 Node — 它是**开发工具**，用于同步数据到 `data.js`，不在运行时调用。

### 4.2 大文件优化（可选）

| 目录 | 大小 | 说明 |
|------|------|------|
| `diagram/` | 21MB | SVG + PNG，可考虑只保留 SVG 减小体积 |
| `cover-image/` | 6.9MB | SVG + PNG，同上 |

当前 51MB 对 nginx 无压力，不做强制要求。如果想优化，每个产业链只保留 SVG（放弃 PNG @2x），可缩减约 50%。

### 4.3 内容更新流程

```
更新 content/raw/*.md 或 content/updates/*.json
  → 运行 scripts/sync-blog-data.mjs（更新 data.js）
  → 推送到 GitHub（blog/index.html + blog/assets/ 不变，只 data.js 变）
  → 服务器上 git pull 即可生效（无需重启，nginx 直接读文件）
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

# Step 2: 修改 nginx 配置
sudo tee -a /etc/nginx/sites-enabled/3l > /dev/null << 'EOF'

    # 产业链研究库（静态站点）
    location /chain/ {
        alias /home/ubuntu/industrial-chain-tracker/;
        index blog/index.html;
    }
EOF

# Step 3: 重载 nginx
sudo nginx -t && sudo systemctl reload nginx

# Step 4: 验证
curl -s -o /dev/null -w "%{http_code} %{size_download}B" http://localhost/chain/
curl -s -o /dev/null -w "%{http_code} %{size_download}B" http://localhost/chain/blog/assets/app.js
curl -s -o /dev/null -w "%{http_code} %{size_download}B" http://localhost/chain/README.md
curl -s -o /dev/null -w "%{http_code} %{size_download}B" http://localhost/chain/diagram/pcb-industry-chain/pcb-industry-chain-map.svg

# Step 5: 浏览器访问
# https://43.136.177.133/chain/
```
