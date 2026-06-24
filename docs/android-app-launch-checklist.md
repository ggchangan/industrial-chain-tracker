# Android App 开发与上线清单

Android App 与 iOS App 一样复用 `apps/mobile` 这套 uni-app 代码。首版定位为产业链研究阅读版：先完成浏览、搜索、详情页、图谱、原文阅读和个股 K 线入口；登录、推送和离线能力后续逐步补。

商店文案、截图说明、审核备注、权限说明和隐私问卷口径见 `docs/app-store-submission-kit.md`。

## 当前已具备

- App 平台构建脚本：`npm --prefix apps/mobile run build:app-android`。
- Android readiness 检查脚本：`npm run verify:android-app`。
- 生产 API：`https://api.industry.ygys30ds.cloud`。
- 生产静态资源：`https://static.industry.ygys30ds.cloud`。
- Android package 占位：

  ```text
  cloud.ygys30ds.industrychain
  ```

- Android 权限已收敛为首版阅读 App 所需的最小集合：
  - `INTERNET`
  - `ACCESS_NETWORK_STATE`
  - `VIBRATE`
- App 内关于、隐私政策和用户协议入口；正式 URL 可通过移动端环境变量替换。
- App 内帮助反馈入口；正式支持 URL 和反馈邮箱可通过移动端环境变量替换。

## 本地构建

```bash
cd /Users/renzhang/Documents/industrial-chain-tracker
npm run verify:mobile-release
npm run verify:android-app
npm --prefix apps/mobile run build:app-android
```

产物位于：

```text
apps/mobile/dist/build/app
```

该目录是 uni-app App 平台资源，不是最终 APK/AAB。最终 Android 包需要使用 HBuilderX 或 DCloud 云打包生成。

## 需要你补齐的 Android 侧资料

1. 最终 Android package name。
2. Android 签名证书。
3. 1024×1024 App 图标和启动图。
4. 隐私政策 URL。
5. 用户协议 URL。
6. 应用市场账号：
   - 华为应用市场
   - 小米应用商店
   - OPPO 软件商店
   - vivo 应用商店
   - 腾讯应用宝
   - 其他目标市场
7. 应用名称、简介、分类、关键词。
8. 手机截图，建议覆盖：
   - 首页产业链列表和搜索。
   - 产业链详情当前重点。
   - 原文阅读。
   - 个股集中营 / 市场验证入口。

## 打包建议

首版建议用 HBuilderX 或 DCloud 云打包：

1. 用 HBuilderX 打开 `apps/mobile`。
2. 确认 `manifest.json` 的 AppID、package、版本号。
3. 选择发行 Android App。
4. 上传 Android 签名证书。
5. 生成 APK 或 AAB。
6. 在目标应用市场逐个提交。

如果 Android package 改动，需同步修改：

```text
apps/mobile/src/manifest.json
```

## 首版 Android 功能边界

首版 Android App 先聚焦阅读体验：

- 支持未登录浏览。
- 支持搜索。
- 支持完整研究原文阅读。
- 支持图谱预览。
- 支持查看个股新浪 K 线入口。

暂不阻塞首版上线：

- Android 账号登录。
- 收藏、订阅和阅读历史跨端同步。
- 推送通知。
- 离线缓存。

## 上线前真机验收

1. 冷启动进入首页不白屏。
2. 首页产业链列表加载成功。
3. 搜索“光模块”“半导体”等关键词有结果。
4. 打开产业链详情，当前重点、最新研究、核心逻辑和跟踪验证可读。
5. 图谱可点击预览。
6. 原文按需加载成功，目录和阅读进度不影响返回。
7. 未登录点击收藏/订阅时提示“App 登录待接入”或“请先登录”，不崩溃。
8. 所有图片和正文资源均来自 HTTPS。
9. 弱网下失败提示可理解。
10. 首页底部“关于 / 隐私政策 / 用户协议”可打开。
11. 首页底部“帮助反馈”可打开；若已配置邮箱，可复制反馈邮箱。
12. 安装包权限列表不出现相机、通讯录、定位、读取手机状态、读写外部存储等首版未使用权限。

## 和鸿蒙的关系

Android 包可以覆盖一部分仍兼容 Android 应用的华为设备，但不等同于 HarmonyOS NEXT 原生应用。

鸿蒙原生版单独作为第二阶段 TODO，不在 Android 首版里同时展开，避免把当前阅读版上线链路拉复杂。
