# iOS App 开发与上线清单

本项目的 iOS App 使用 `apps/mobile` 这套 uni-app 代码，不另建一套原生业务逻辑。目标是让网页版、微信小程序和 iOS App 共用同一个内容 API、同一套产业链详情结构和同一批个人功能接口。

商店文案、截图说明、审核备注和隐私问卷口径见 `docs/app-store-submission-kit.md`。

## 当前已具备

- 产业链列表、搜索、详情页、图谱预览。
- 当前重点、最新研究、核心逻辑、跟踪验证、个股集中营和按需加载原文。
- 生产 API：`https://api.industry.ygys30ds.cloud`。
- 生产静态资源：`https://static.industry.ygys30ds.cloud`。
- App 平台构建脚本：`npm --prefix apps/mobile run build:app-ios`。
- iOS readiness 检查脚本：`npm run verify:ios-app`。
- App 端登录保护：当前不会误调用微信小程序登录；Apple 登录接入前，App 可先作为只读研究库使用。
- App 内关于、帮助反馈、隐私政策和用户协议入口；正式 URL 和反馈邮箱可通过移动端环境变量替换。

## 本地构建

```bash
cd /Users/renzhang/Documents/industrial-chain-tracker
npm run verify:ios-app
npm --prefix apps/mobile run build:app-ios
```

产物位于：

```text
apps/mobile/dist/build/app
```

该目录是 uni-app 的 App 平台资源，不是最终 `.ipa`。最终真机运行、签名和上传 App Store Connect 需要使用 HBuilderX 或 DCloud 云打包。

## 需要你补齐的 Apple 侧资料

1. Apple Developer Program 账号。
2. App Store Connect 中创建 App。
3. Bundle ID，当前代码占位为：

   ```text
   cloud.ygys30ds.industrychain
   ```

4. iOS Distribution 证书和 Provisioning Profile。
5. App 图标，至少 1024×1024，无透明通道。
6. 隐私政策 URL。
7. 用户协议 URL。
8. App 名称、关键词、简介、分类。
9. iPhone 截图，建议至少覆盖：
   - 首页产业链列表和搜索。
   - 产业链详情当前重点。
   - 原文阅读。
   - 个股集中营 / 市场验证入口。

## 打包建议

首版建议采用 DCloud 云打包或 HBuilderX 打包：

1. 用 HBuilderX 打开 `apps/mobile`。
2. 确认 `manifest.json` 的 AppID、Bundle ID、版本号。
3. 选择发行 iOS App。
4. 上传 Apple 证书和描述文件。
5. 生成 `.ipa` 后上传 App Store Connect。

如果 Bundle ID 改动，需同步修改：

```text
apps/mobile/src/manifest.json
```

## 首版 iOS 功能边界

首版 iOS App 先聚焦阅读体验：

- 支持未登录浏览。
- 支持搜索。
- 支持完整研究原文阅读。
- 支持图谱预览。
- 支持查看个股新浪 K 线入口。

暂不阻塞首版上线：

- Apple 登录。
- 收藏、订阅和阅读历史跨端同步。
- 推送通知。
- 离线缓存。

这些功能已有服务端个人接口基础，后续可在接入 Apple 登录后逐步开放。

## 上线前真机验收

1. 冷启动进入首页不白屏。
2. 首页产业链列表加载成功。
3. 搜索“光模块”“半导体”等关键词有结果。
4. 打开产业链详情，当前重点、最新研究、核心逻辑和跟踪验证可读。
5. 图谱可点击预览。
6. 原文按需加载成功，目录和阅读进度不影响返回。
7. 未登录点击收藏/订阅时提示“账号登录待接入”或“请先登录”，不崩溃。
8. 所有图片和正文资源均来自 HTTPS。
9. 弱网下失败提示可理解。
10. 首页底部“关于 / 隐私政策 / 用户协议”可打开。
11. 首页底部“帮助反馈”可打开；若已配置邮箱，可复制反馈邮箱。
12. App Store 隐私问卷与实际行为一致：首版不做跨 App 跟踪，不采集定位、通讯录、相册或相机。

## 后续登录方案

iOS App 不应复用微信小程序 `code2Session` 登录。推荐后续新增：

```text
Sign in with Apple
  -> 后端校验 identityToken
  -> 生成现有 USER_SESSION_SECRET 签发的应用 token
  -> 复用 /api/v1/me 收藏、订阅和阅读历史接口
```

对应新增接口建议：

```text
POST /api/v1/auth/apple-login
POST /api/v1/auth/logout
GET  /api/v1/me
```

这样个人数据模型可以继续复用当前 MySQL 结构，不需要为 iOS 单独建一套用户系统。

Android 阅读版上线资料见 `docs/android-app-launch-checklist.md`。HarmonyOS NEXT 原生版暂不和
Android 首版同时展开，后续 TODO 见 `docs/mobile-next-todo.md`。
