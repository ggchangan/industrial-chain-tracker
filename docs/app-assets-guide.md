# App 图标、启动图和截图素材规范

本文记录 iOS / Android 阅读版上架前需要准备的视觉素材。当前仓库已经生成一套可用于开发、真机测试和提交流程预演的占位素材；正式上线前可以替换为设计稿。

## 已生成素材

生成脚本：

```bash
node scripts/generate-mobile-assets.mjs
```

当前源图：

```text
assets/brand/mini-program-avatar-v2-512.png
```

输出目录：

```text
apps/mobile/src/static/brand
```

| 文件 | 尺寸 | 用途 |
|---|---:|---|
| `app-icon-1024.png` | 1024×1024 | iOS App Store 图标、通用 App 图标源 |
| `app-icon-512.png` | 512×512 | 通用预览图标 |
| `android-icon-432.png` | 432×432 | Android 高分辨率图标 |
| `android-icon-216.png` | 216×216 | Android 中分辨率图标 |
| `android-icon-108.png` | 108×108 | Android 小尺寸图标 |
| `launch-1242x2688.png` | 1242×2688 | iPhone 大屏启动占位图 |
| `launch-1170x2532.png` | 1170×2532 | iPhone 常用启动占位图 |
| `launch-1080x2400.png` | 1080×2400 | Android 常用启动占位图 |

## 正式上线前建议

### App 图标

要求：

- 1024×1024 PNG。
- 无透明通道。
- 不要自己预先裁圆角，交给系统处理。
- 图标中文字应尽量少，避免小尺寸不可读。
- iOS 和 Android 可以共用主视觉，但 Android 应用市场可能还会要求不同尺寸。

建议设计方向：

```text
深色底 + 产业链节点图谱 + 研究/逻辑感的线条
```

### 启动图

要求：

- 不展示过多文字。
- 保持深色背景，与 App 首页一致。
- 适配全面屏安全区域。
- 可以只展示品牌名和一句 slogan。

当前启动图文案：

```text
产业链研究库
用图谱理解产业链 · 用研究跟踪变化
```

### 截图

至少准备 4 张：

1. 首页产业链列表与搜索。
2. 产业链详情当前重点。
3. 核心逻辑 / 最新研究。
4. 原文阅读 / 个股集中营。

截图上的说明文案见 `docs/app-store-submission-kit.md`。

## 替换流程

如果拿到正式设计稿：

1. 替换源图或直接替换 `apps/mobile/src/static/brand` 下的目标文件。
2. 如替换源图，修改 `scripts/generate-mobile-assets.mjs` 的 `sourceIcon`。
3. 重新运行：

   ```bash
   node scripts/generate-mobile-assets.mjs
   npm run verify:ios-app
   npm run verify:android-app
   npm --prefix apps/mobile run build:app-ios
   ```

4. 真机检查启动图是否拉伸、裁切或文字过小。

## 注意

当前生成素材是工程占位和上线流程预演素材。正式上架前，建议至少人工确认：

- 图标是否符合 App Store 与各安卓市场规范。
- 启动图在 iPhone 与 Android 主流机型上是否不变形。
- 图标和应用名称是否与商店资料一致。
