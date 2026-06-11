# 生产部署

生产环境采用腾讯云 CCR 私有镜像仓库、Docker Compose 和宿主机 Nginx：

```text
GitHub main
  -> 本地构建 linux/amd64 镜像
  -> ccr.ccs.tencentyun.com/ygys30ds/industrial-chain-tracker
  -> 腾讯云服务器拉取指定版本
  -> 127.0.0.1:4173
  -> Nginx HTTPS 四域名
```

## 1. 合并并发布镜像

只从最新 `main` 发布生产镜像：

```bash
git switch main
git pull --ff-only origin main
docker login ccr.ccs.tencentyun.com
bash deploy/publish-image.sh
```

脚本同时推送 Git 短提交号标签和 `latest`。生产部署应优先使用提交号标签，
例如 `3ac4ff8`，便于确认版本和回滚。

## 2. 首次准备服务器

```bash
ssh ubuntu@43.136.177.133
sudo apt update
sudo apt install -y docker-compose-v2
sudo usermod -aG docker ubuntu
```

重新登录 SSH 后确认：

```bash
docker compose version
```

将仓库放在 `/home/ubuntu/industrial-chain-tracker`，并创建生产配置：

```bash
cd /home/ubuntu/industrial-chain-tracker
cp .env.example .env
openssl rand -hex 32
nano .env
chmod 600 .env
```

`.env` 必须设置：

```dotenv
ADMIN_PASSWORD=使用至少10位的独立维护密码
ADMIN_SESSION_SECRET=使用openssl生成的至少32位随机字符串
CORS_ORIGIN=https://industry.ygys30ds.cloud
IMAGE_TAG=latest
```

不要提交 `.env`，也不要通过聊天或工单传递其中的秘密。

登录 CCR：

```bash
docker login ccr.ccs.tencentyun.com
```

## 3. 部署指定版本

```bash
cd /home/ubuntu/industrial-chain-tracker
git switch main
git pull --ff-only origin main
bash deploy/deploy.sh <Git短提交号>
```

脚本会拉取镜像、更新容器并检查
`http://127.0.0.1:4173/api/v1/health`。

## 4. 配置 Nginx

复制配置和公共片段：

```bash
sudo mkdir -p /etc/nginx/snippets
sudo cp deploy/nginx/industry-ssl.conf /etc/nginx/snippets/
sudo cp deploy/nginx/industry-proxy.conf /etc/nginx/snippets/
sudo cp deploy/nginx.conf /etc/nginx/sites-available/industry
sudo ln -sfn /etc/nginx/sites-available/industry /etc/nginx/sites-enabled/industry
```

服务器当前证书文件应为：

```text
/etc/nginx/cert/ygys30ds.crt
/etc/nginx/cert/ygys30ds.cloud.key
```

应用前必须检查，避免影响同机其他站点：

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 5. 验证

```bash
curl https://industry.ygys30ds.cloud/api/v1/health
curl https://api.industry.ygys30ds.cloud/api/v1/health
curl -I https://static.industry.ygys30ds.cloud/assets/styles.css
curl -I https://admin.industry.ygys30ds.cloud/admin-login.html
```

对应职责：

| 域名 | 职责 |
|---|---|
| `industry.ygys30ds.cloud` | 网页阅读端，同时保留同源 `/api/` |
| `api.industry.ygys30ds.cloud` | 小程序、iOS、Android 共用 API |
| `static.industry.ygys30ds.cloud` | 图片、图谱和前端静态资源 |
| `admin.industry.ygys30ds.cloud` | 密码保护的维护入口 |

## 6. 回滚

查找上一个已发布的提交号标签，然后部署该标签：

```bash
bash deploy/deploy.sh <上一个Git短提交号>
```

不要依赖 `latest` 回滚，因为它会随每次发布移动。
