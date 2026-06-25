# 多端产品路线

## 目标架构

所有客户端共用同一内容服务：

```text
Git 内容仓库
  ↓ 同步与校验
内容 API / 搜索 / 正文渲染
  ├─ 网页版
  ├─ 微信小程序
  ├─ iOS App
  ├─ Android App
  └─ HarmonyOS NEXT 原生版（第二阶段评估）
```

维护者登录和未来的写入 API 与公开阅读 API 分离。真实密码、会话密钥和发布凭证只保存在服务器环境变量或密钥服务中。

## 第一阶段：公共内容服务

已实现：

- 完整资料库与产业链列表 API
- 单条产业链与 Markdown/HTML 正文 API
- 服务端跨产业链搜索
- API 优先、静态数据回退的网页版
- 维护者密码登录、签名 Cookie、登录限流
- 维护页面和维护说明的服务端访问控制

## 第二阶段：微信小程序 MVP

已建立 `apps/mobile` uni-app 工程并实现：

- 产业链列表
- 跨产业链搜索
- 产业链详情与图谱预览
- 核心逻辑、专属追踪和最新动态
- 服务端渲染的正式文章
- 面向小程序/App 的产业链详情摘要：当前重点、最新研究、核心逻辑、结构、跟踪、个股和原文入口统一由 API 返回
- 公开网页首页顶部也复用同一套详情摘要，保持网页、小程序和未来 App 的阅读顺序一致
- 移动端详情页默认先加载摘要与结构，完整原文 HTML 改为按需加载；搜索结果跳正文时自动加载原文并定位

上线前待办：

- 申请或确认微信小程序 AppID
- 增加微信登录/登出：小程序端使用 `uni.login` 获取 code，后端通过微信 `code2Session` 换取 openid/session_key，生成自有登录态；退出登录清除本地 token 与后端会话
- 配置已备案的 HTTPS API 域名
- 在微信公众平台加入 request 合法域名
- 在真机检查长表格、图片预览、分享卡片和弱网体验
- 补充隐私政策、用户协议和小程序类目
- 跟随 DCloud 官方工具链升级复查 `npm audit`；当前告警来自构建依赖，不随小程序产物部署

## 第三阶段：阅读体验增强

- 收藏产业链、公司和关键词
- 阅读历史与目录位置恢复
- 动态更新订阅
- 公司交叉图谱
- 搜索结果精准跳转到正文段落
- 分享卡片和产业链二维码
- 市场验证：公司行情外链、区间表现、基准对比和研究事件叠加

市场验证功能的详细分期与数据结构见 `docs/market-validation-roadmap.md`。

收藏、订阅和跨设备同步需要微信登录和用户数据库；未登录时可以先允许只读浏览，避免阻塞首次阅读。

## 第四阶段：iOS 与 Android 阅读版

已开始使用 `apps/mobile` 业务代码支持 iOS 与 Android App：

- App 平台构建脚本和 iOS / Android manifest 基础配置
- 生产 HTTPS API / 静态资源配置
- iOS / Android readiness 检查脚本
- App 端登录保护：Apple 登录接入前不误调用微信小程序登录

首版 iOS 阅读版上线资料见 `docs/ios-app-launch-checklist.md`。
首版 Android 阅读版上线资料见 `docs/android-app-launch-checklist.md`。

上线前可运行聚合检查：

```bash
npm run verify:mobile-release
npm run verify:mobile-release -- --api https://api.industry.ygys30ds.cloud --build-app
```

第一条用于本地 readiness 与测试；第二条额外检查生产 API 并构建 App 平台产物。

后续按平台补充：

- Apple/Android 登录与推送
- 深色模式和系统字体适配
- 离线缓存与后台更新
- App Store、各安卓市场的隐私和审核材料

HarmonyOS NEXT 原生版不和 Android 首版混在一起推进。第二阶段 TODO 见
`docs/mobile-next-todo.md`：先确认是否需要原生鸿蒙上架，再评估 uni-app x / Harmony
NEXT 构建链路、证书、包名、隐私材料和兼容性。

## 第五阶段：在线内容管理

当前维护仍采用 Git 工作流。正式在线后台建议增加：

- 产业链草稿、预览与发布
- Markdown 编辑和图片上传
- 动态追踪录入
- 版本历史和回滚
- 操作审计
- 角色权限

写入 API 不与公开 API 使用同一权限域，发布动作必须保留版本记录。
