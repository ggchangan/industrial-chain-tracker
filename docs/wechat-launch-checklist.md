# 微信小程序上线检查清单

## 已配置

- AppID：`wxc099f3e25b3ee919`
- 生产 API：`https://industry.ygys30ds.cloud`
- 小程序头像：`apps/mobile/src/static/brand/mini-program-avatar-v2.png`
- 内容 API、服务端搜索和 HTML 正文
- 维护者密码登录与服务端访问控制

## 当前阻塞

截至 2026-06-11，`industry.ygys30ds.cloud` 的 443 端口返回自签名证书：

- 证书主题：`CN=43.136.177.133`
- 证书不是签发给 `industry.ygys30ds.cloud`
- 微信小程序不会接受该证书

同时，线上域名仍在提供旧版静态网页，`/api/v1/health` 尚未通过可信 HTTPS 对外提供。

## 上线顺序

1. 为 `industry.ygys30ds.cloud` 申请可信证书，例如 Let's Encrypt。
2. 将 `codex/content-api-miniapp` 已合入主线的 Node 服务部署到服务器。
3. 外层 Nginx 将 HTTPS 请求反向代理到 `172.20.0.2:4173`。
4. 设置生产 `.env`：

```bash
ADMIN_PASSWORD=使用密码管理器生成的长密码
ADMIN_SESSION_SECRET=至少32位随机字符串
```

5. 验证：

```bash
curl https://industry.ygys30ds.cloud/api/v1/health
curl -I https://industry.ygys30ds.cloud/maintain.html
```

预期健康接口返回 `status: ok`，维护台返回 `302` 并跳转登录页。

6. 在微信公众平台配置：
   - 开发管理 → 开发设置 → 服务器域名
   - request 合法域名：`https://industry.ygys30ds.cloud`
7. 执行 `npm run mobile:build:weixin`。
8. 微信开发者工具导入 `apps/mobile/dist/build/mp-weixin`。
9. 完成真机预览、体验版、审核和发布。

## 证书示例

若服务器使用 Ubuntu Nginx，可在确认 DNS 已指向服务器后执行：

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d industry.ygys30ds.cloud
```

执行前应备份现有 Nginx 配置。证书签发后再次检查证书域名、完整链和自动续期。
