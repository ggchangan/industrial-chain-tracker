FROM nginx:alpine

# 无运行时依赖，纯静态文件服务
# 构建时不需要额外步骤，直接把仓库内容复制进去

COPY . /app/

# nginx 配置
# - web root = /app（对齐 data.js 中的 ../ 相对路径）
# - 默认首页 = blog/index.html
# - 纯静态服务，无 SPA 回退
RUN rm /etc/nginx/conf.d/default.conf
COPY deploy/nginx.conf /etc/nginx/conf.d/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
