# 产业链研究库移动端

基于 uni-app Vue 3/Vite，同一份源码优先编译微信小程序，后续可继续编译 iOS、Android 和 H5。

## 本地准备

```bash
cd apps/mobile
cp .env.example .env
npm install
```

将 `.env` 中的 `VITE_API_BASE_URL` 改为部署后的 HTTPS 内容服务域名。

## 微信小程序

1. 在 `src/manifest.json` 的 `mp-weixin.appid` 填写小程序 AppID。
2. 在微信公众平台把 API 域名加入 request 合法域名。
3. 编译并使用微信开发者工具打开：

```bash
npm run dev:mp-weixin
```

生产构建：

```bash
npm run build:mp-weixin
```

产物位于 `dist/build/mp-weixin`。

## 当前功能

- 产业链列表
- 跨产业链搜索
- 四层/三层产业链骨架
- 图谱查看与放大
- 核心逻辑和专属追踪指标
- 最新动态
- 服务端 Markdown 正文渲染
