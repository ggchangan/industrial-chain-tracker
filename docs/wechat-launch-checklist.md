# 微信小程序上线检查清单

## 已配置

- AppID：`wxc099f3e25b3ee919`
- 生产 API：`https://api.industry.ygys30ds.cloud`
- 静态资源：`https://static.industry.ygys30ds.cloud`
- 小程序头像：`assets/brand/mini-program-avatar-v2-512.png`
- 内容 API、服务端搜索和 HTML 正文
- 维护者密码登录与服务端访问控制
- 四个生产域名均已解析至 `43.136.177.133`
- 证书包含 `*.industry.ygys30ds.cloud`

## 上线顺序

1. 将生产配置分支合并到 `main`。
2. 在服务器最新 `main` 上运行 `bash deploy/release.sh`。
3. 确认脚本完成 CCR 推送、容器更新和健康检查。
4. 应用 `deploy/nginx.conf` 中的四域名 Nginx 配置。
5. 验证：

```bash
curl https://industry.ygys30ds.cloud/api/v1/health
curl https://api.industry.ygys30ds.cloud/api/v1/health
curl -I https://static.industry.ygys30ds.cloud/assets/styles.css
curl -I https://admin.industry.ygys30ds.cloud/admin-login.html
```

6. 在微信公众平台配置服务器域名：
   - request 合法域名：`https://api.industry.ygys30ds.cloud`
   - downloadFile 合法域名：`https://static.industry.ygys30ds.cloud`
7. 执行 `npm run mobile:build:weixin`。
8. 微信开发者工具导入 `apps/mobile/dist/build/mp-weixin`。
9. 完成真机预览、体验版、审核和发布。

生产 `.env` 必须包含独立维护密码和随机 Session 密钥：

```dotenv
ADMIN_PASSWORD=使用密码管理器生成的长密码
ADMIN_SESSION_SECRET=使用openssl生成的至少32位随机字符串
CORS_ORIGIN=https://industry.ygys30ds.cloud
```

`.env` 不得提交到 Git，也不要通过聊天传递其中的秘密。
