# 产业链研究库移动端

基于 uni-app Vue 3/Vite，同一份源码编译微信小程序和 App 平台。当前优先支持微信小程序、iOS App 阅读版和 Android App 阅读版，后续可继续扩展 HarmonyOS NEXT 原生版和 H5。

## 本地准备

```bash
cd apps/mobile
cp .env.example .env
npm install
```

生产 API 已配置为 `https://api.industry.ygys30ds.cloud`，图片等静态资源使用
`https://static.industry.ygys30ds.cloud`。本地调试时可在 `.env` 中覆盖
`VITE_API_BASE_URL` 和 `VITE_STATIC_BASE_URL`。

隐私政策和用户协议正式 URL 可通过环境变量配置：

```dotenv
VITE_PRIVACY_POLICY_URL=https://...
VITE_SUPPORT_EMAIL=support@example.com
VITE_SUPPORT_URL=https://...
VITE_TERMS_OF_SERVICE_URL=https://...
```

未配置正式 URL 或邮箱时，App 内会展示首版占位说明，方便开发测试和审核材料准备。

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

小程序头像使用仓库根目录的
`assets/brand/mini-program-avatar-v2-512.png`，在微信公众平台后台单独上传。

## iOS App

iOS App 复用同一套页面、API 和阅读结构。首版 App 先开放未登录浏览、搜索、详情页、图谱、原文阅读和个股 K 线入口；Apple 登录接入前，收藏、订阅和跨端阅读历史暂不作为上线阻塞项。

构建前检查：

```bash
cd ../..
npm run verify:ios-app
```

构建 App 平台资源：

```bash
cd apps/mobile
npm run build:app-ios
```

产物位于 `dist/build/app`。这不是最终 `.ipa`，需要用 HBuilderX 或 DCloud 云打包继续完成 iOS 证书签名、真机安装和 App Store 上传。

详细上线材料见仓库根目录：

```text
docs/ios-app-launch-checklist.md
```

## Android App

Android App 复用 App 平台同一套页面和 API。首版同样定位为阅读版；Android 登录、推送和离线缓存后续再接。

构建前检查：

```bash
cd ../..
npm run verify:android-app
```

构建 App 平台资源：

```bash
cd apps/mobile
npm run build:app-android
```

产物位于 `dist/build/app`。最终 APK/AAB 需要用 HBuilderX 或 DCloud 云打包生成。

详细上线材料见仓库根目录：

```text
docs/android-app-launch-checklist.md
```

HarmonyOS NEXT 原生版暂不和 Android 首版同时展开，后续任务见：

```text
docs/mobile-next-todo.md
```

## 当前功能

- 产业链列表
- 跨产业链搜索
- 四层/三层产业链骨架
- 图谱查看与放大
- 核心逻辑和专属追踪指标
- 最新动态
- 服务端 Markdown 正文渲染
- 微信小程序登录、退出登录、收藏、订阅和阅读历史
- iOS App 平台构建与只读阅读版上线准备
- Android App 平台构建与只读阅读版上线准备
- 关于、帮助反馈、隐私政策和用户协议入口
