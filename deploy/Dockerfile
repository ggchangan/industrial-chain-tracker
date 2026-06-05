FROM nginx:alpine

# 目录结构已对齐：index.html + assets/ 在根目录
# 所有相对路径（./assets/、./diagram/ 等）均正确解析

COPY . /usr/share/nginx/html/
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
