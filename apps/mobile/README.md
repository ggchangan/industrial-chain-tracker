# 产业链研究库移动端

基于 uni-app Vue 3/Vite，同一份源码优先编译微信小程序，后续可继续编译 iOS、Android 和 H5。

## 本地准备

```bash
cd apps/mobile
cp .env.example .env
npm install
```

生产 API 已配置为 `https://api.industry.ygys30ds.cloud`，图片等静态资源使用
`https://static.industry.ygys30ds.cloud`。本地调试时可在 `.env` 中覆盖
`VITE_API_BASE_URL` 和 `VITE_STATIC_BASE_URL`。

## 微信小程序

当前 AppID：`wxc099f3e25b3ee919`。

1. 确认 API 与静态资源域名均使用可信 HTTPS 证书。
2. 在微信公众平台将 `https://api.industry.ygys30ds.cloud` 加入 request 合法域名。
3. 将 `https://static.industry.ygys30ds.cloud` 加入 downloadFile 合法域名。
4. 编译并使用微信开发者工具打开：

```bash
npm run dev:mp-weixin
```

生产构建：

```bash
npm run build:mp-weixin
```

产物位于 `dist/build/mp-weixin`。

小程序头像使用 `src/static/brand/mini-program-avatar-v2.png`，在微信公众平台后台单独上传。

## 当前功能

- 产业链列表
- 跨产业链搜索
- 四层/三层产业链骨架
- 图谱查看与放大
- 核心逻辑和专属追踪指标
- 最新动态
- 服务端 Markdown 正文渲染
