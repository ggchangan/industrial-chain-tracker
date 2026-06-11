#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REGISTRY_IMAGE="ccr.ccs.tencentyun.com/ygys30ds/industrial-chain-tracker"
IMAGE_TAG="${1:-$(git -C "$REPO_DIR" rev-parse --short HEAD)}"

if ! docker info >/dev/null 2>&1; then
    echo "Docker is not running or the current user cannot access it." >&2
    exit 1
fi

echo "Building ${REGISTRY_IMAGE}:${IMAGE_TAG}"
docker build \
    --platform linux/amd64 \
    --label "org.opencontainers.image.revision=$(git -C "$REPO_DIR" rev-parse HEAD)" \
    --label "org.opencontainers.image.created=$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    --file "$REPO_DIR/deploy/Dockerfile" \
    --tag "${REGISTRY_IMAGE}:${IMAGE_TAG}" \
    --tag "${REGISTRY_IMAGE}:latest" \
    "$REPO_DIR"

docker push "${REGISTRY_IMAGE}:${IMAGE_TAG}"
docker push "${REGISTRY_IMAGE}:latest"

echo "Published ${REGISTRY_IMAGE}:${IMAGE_TAG}"
