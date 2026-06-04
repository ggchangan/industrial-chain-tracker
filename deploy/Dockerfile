FROM nginx:alpine

# 目录结构已对齐：index.html + assets/ 在根目录
# 所有相对路径（./assets/、../diagram/ 等）均正确解析
# 无需自定义 nginx 配置，默认配置即工作

COPY . /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
