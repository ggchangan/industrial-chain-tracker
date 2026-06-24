# 多端 App 后续 TODO

本文记录第一阶段之后的移动端任务。当前优先级是先把 iOS 与 Android 阅读版跑通，再决定是否展开鸿蒙原生版。

## 第一阶段：iOS + Android 阅读版

状态：进行中。

- iOS App 工程支持、readiness 检查和上线清单已建立。
- Android App 工程支持、readiness 检查和上线清单已建立。
- 首版 App 允许未登录浏览、搜索、查看图谱、阅读原文和打开个股 K 线。
- Apple/Android 登录、推送、离线缓存不阻塞首版阅读版。

## 第二阶段：账号登录与个人功能

待做：

- 接入 Sign in with Apple：
  - 新增 `POST /api/v1/auth/apple-login`。
  - 后端校验 Apple `identityToken`。
  - 复用当前 `USER_SESSION_SECRET` 签发应用 token。
  - 复用 `/api/v1/me` 收藏、订阅和阅读历史接口。
- 评估 Android 登录方式：
  - 手机号验证码。
  - 微信开放平台 App 登录。
  - 国内应用市场账号能力。
- App 端打开收藏、订阅和阅读历史跨端同步。
- 评估推送：
  - 订阅产业链动态。
  - 重要研究更新提醒。

## 第二阶段：鸿蒙原生版评估

待做：

- 明确目标是否是 HarmonyOS NEXT 原生上架，而不是仅覆盖可运行 Android 包的华为设备。
- 调研 DCloud uni-app x / Harmony NEXT 构建链路。
- 评估现有 Vue 页面、API 层、rich-text 原文阅读、图片预览和外链打开在鸿蒙原生环境的兼容性。
- 明确鸿蒙包名、证书、华为开发者账号、隐私材料和审核要求。
- 决定是否新建鸿蒙专用构建脚本和 readiness 检查。

当前判断：

```text
先做 iOS + Android 阅读版上线；鸿蒙原生版等首版 App 跑通后再单独立项。
```

## 第三阶段：App 阅读体验增强

待做：

- 深色模式与系统字体进一步适配。
- 原文阅读离线缓存。
- 图谱大图缓存。
- 搜索历史和最近访问。
- 分享卡片。
- App 内隐私政策、用户协议和关于页面。
