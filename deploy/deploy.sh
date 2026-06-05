#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
IMAGE_NAME="chain-tracker"
CONTAINER_NAME="chain-tracker"
NETWORK_NAME="chain-net"
CONTAINER_IP="172.20.0.2"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; exit 1; }

echo "════════════════════════════════════════"
echo "  产业链研究库 — 一键部署"
echo "════════════════════════════════════════"
echo ""

# ── Step 1: 检查 Docker ──
echo "[1/5] 检查 Docker…"
if ! command -v docker &>/dev/null; then
    err "Docker 未安装。请先安装 Docker: curl -fsSL https://get.docker.com | bash"
fi
log "Docker 已就绪"

# ── Step 2: 构建镜像 ──
echo "[2/5] 构建 Docker 镜像…"
cd "$REPO_DIR"
sudo docker build -t "$IMAGE_NAME:latest" -f deploy/Dockerfile . 2>&1 | tail -1
log "镜像构建完成"

# ── Step 3: 创建网络 ──
echo "[3/5] 检查 Docker 网络…"
if ! sudo docker network ls --format '{{.Name}}' | grep -q "^${NETWORK_NAME}$"; then
    sudo docker network create --subnet=172.20.0.0/16 "$NETWORK_NAME"
    log "网络 $NETWORK_NAME 已创建"
else
    log "网络 $NETWORK_NAME 已存在"
fi

# ── Step 4: 停止并清理旧容器 ──
echo "[4/5] 检查旧容器…"
if sudo docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    warn "发现旧容器，正在停止并删除…"
    sudo docker stop "$CONTAINER_NAME" >/dev/null 2>&1 || true
    sudo docker rm "$CONTAINER_NAME" >/dev/null 2>&1 || true
    log "旧容器已清理"
else
    log "无旧容器"
fi

# ── Step 5: 启动新容器（无端口映射，固定IP）──
echo "[5/5] 启动新容器 (IP: ${CONTAINER_IP})…"
sudo docker run -d \
    --name "$CONTAINER_NAME" \
    --network "$NETWORK_NAME" \
    --ip "$CONTAINER_IP" \
    --restart unless-stopped \
    "$IMAGE_NAME:latest" >/dev/null

sleep 2
log "容器已启动"

# ── 验证 ──
echo ""
if curl -s -o /dev/null -w "%{http_code}" "http://${CONTAINER_IP}/" | grep -q 200; then
    log "部署成功！"
    echo ""
    echo "════════════════════════════════════════"
    echo "  容器IP: http://${CONTAINER_IP}/"
    echo "  公网访问需要 nginx 反代"
    echo "  示例 nginx 配置:"
    echo ""
    echo "  server {"
    echo "      listen 80;"
    echo "      server_name your.domain.com;"
    echo "      location / {"
    echo "          proxy_pass http://${CONTAINER_IP}:80;"
    echo "      }"
    echo "  }"
    echo "════════════════════════════════════════"
else
    warn "服务响应异常，查看容器日志："
    sudo docker logs "$CONTAINER_NAME" --tail 10
    exit 1
fi
