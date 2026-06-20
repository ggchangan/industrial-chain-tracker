# 标准研究包规范 v0.2

标准研究包用于把自有研究、视频转写和网络文章统一导入产业链知识库。人工只维护研究内容和 `logic.json`，文件身份、哈希、版本与产业链关联由系统生成。

## 目录结构

```text
research-package/
├── article.html
├── source-article.md
├── logic.json
└── assets/
    ├── cover.png
    └── ...
```

- `article.html`：最终阅读原件，可以内嵌图片。
- `source-article.md`：用于主题识别、全文搜索和证据定位。
- `logic.json`：研究逻辑、公司、证据、监控规则和失效条件。
- `assets/`：Markdown 引用的图片及可复用原始资源。
- 不需要人工维护 `research-package.json`。

## 主题识别

系统从 Markdown 第一个一级标题识别主题。例如
`# MPO产业链深度解析：...` 会识别为 `MPO产业链`，并生成稳定主题 ID
`mpo`。首次导入时在维护页面选择归属产业链；包 ID、导入时间、文件哈希和文件清单
由系统生成。

## logic.json

顶层结构：

```json
{
  "schema_version": "0.2",
  "summary": "研究主题摘要",
  "logics": []
}
```

每条逻辑需要：

- 唯一且跨版本稳定的 `key`
- `kind`：`thesis` 或 `risk`
- `status`：`new`、`strengthening`、`stable`、`weakening`、`challenged` 或 `invalidated`
- `title` 与 `statement`
- 关联公司及证券代码
- 至少一条证据、一个监控项和一个失效条件

证据的 `anchor` 必须能在去除 Markdown 加粗等标记后的原文中精确匹配。证据
`key` 暂为推荐字段，缺失只产生警告。

## 上传预检

维护台在入库前检查必需文件、JSON、主题、图片引用、重复 ID、枚举值、证券代码、
证据锚点、监控来源与规则，以及失效条件。错误会阻止入库；警告允许入库。

检测通过后，系统整体保存 HTML、Markdown、JSON 和资源文件，并在产业链资料档案中
建立研究主题记录。
