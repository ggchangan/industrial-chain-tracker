# MySQL 与对象存储架构

## 当前阶段

```text
内容 API
├── State Store
│   ├── file：managed-content.json（默认）
│   └── mysql：腾讯云服务器 MySQL
└── Object Storage
    ├── local：服务器本地数据卷（当前可用）
    └── cos：腾讯云 COS（接口已预留，尚未启用）
```

第一阶段 MySQL 使用一张 JSON 状态表保存现有完整内容模型。这使已有更新、资料、
逻辑卡和研究包可以无损迁移，并保持当前 API 不变。后续增加跨用户查询、订阅和监控
历史时，再将研究主题、逻辑、证据和监控记录拆成规范化业务表。

## 腾讯云 MySQL

建议创建独立数据库和最小权限用户：

```sql
CREATE DATABASE industrial_chain
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER 'industrial_chain'@'应用服务器地址'
  IDENTIFIED BY '请使用强密码';

GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX
  ON industrial_chain.*
  TO 'industrial_chain'@'应用服务器地址';
```

服务器 `.env`：

```env
STATE_STORE_DRIVER=mysql
DATABASE_URL=mysql://industrial_chain:密码@MySQL地址:3306/industrial_chain
MYSQL_STATE_TABLE=industrial_chain_content_state
MYSQL_CONNECTION_LIMIT=5
MYSQL_SSL=false

OBJECT_STORAGE_DRIVER=local
DATA_DIR=/data
```

密码含有 `@`、`:`、`/` 等字符时需要进行 URL 编码。

## 迁移现有状态

切换驱动前先备份数据卷，然后执行：

```bash
set -a
source .env
set +a
npm run migrate:mysql
```

脚本会自动创建状态表，并拒绝用空状态覆盖 MySQL。迁移成功后再把
`STATE_STORE_DRIVER` 改为 `mysql` 并重启服务。

## 对象文件与 COS

当前 `OBJECT_STORAGE_DRIVER=local` 将 HTML、Markdown、JSON、图片和研究包资源写入
`DATA_DIR`，生产 Compose 的命名卷会保留这些文件。

腾讯云 COS 配置契约：

```env
OBJECT_STORAGE_DRIVER=cos
COS_SECRET_ID=
COS_SECRET_KEY=
COS_REGION=ap-shanghai
COS_BUCKET=
COS_PUBLIC_BASE_URL=
```

当前版本选择 `cos` 时会明确拒绝启动，避免误以为文件已经上传。后续 COS 实现复用：

- `putObject(key, contents)`
- `getObject(key)`
- `deleteObject(key)`
- `urlFor(key)`

建议 COS Bucket 默认私有，原始研究包不公开；正式文章和图片通过 CDN 或签名 URL
发布。

## 回退

数据库切换不改变本地对象文件。需要回退时恢复：

```env
STATE_STORE_DRIVER=file
OBJECT_STORAGE_DRIVER=local
```

重启服务即可读取数据卷中的 `managed-content.json`。确认 MySQL 稳定前，不要删除该
文件。
