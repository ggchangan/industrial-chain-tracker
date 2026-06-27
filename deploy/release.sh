#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
CURRENT_BRANCH="$(git -C "$REPO_DIR" branch --show-current)"

if [[ "$CURRENT_BRANCH" != "main" ]]; then
    echo "Production releases must run from main; current branch: ${CURRENT_BRANCH:-detached}" >&2
    exit 1
fi

if [[ -n "$(git -C "$REPO_DIR" status --porcelain)" ]]; then
    echo "The working tree has uncommitted changes. Commit or discard them before release." >&2
    exit 1
fi

git -C "$REPO_DIR" pull --ff-only origin main

IMAGE_TAG="$(git -C "$REPO_DIR" rev-parse --short HEAD)"

if command -v node >/dev/null 2>&1; then
    node "$REPO_DIR/scripts/verify-deploy-config.mjs"
else
    COMPOSE_FILE="$REPO_DIR/deploy/docker-compose.yml"
    grep -Eq 'env_file:' "$COMPOSE_FILE"
    grep -Eq 'format:[[:space:]]*raw' "$COMPOSE_FILE"
    if grep -Eq 'STATE_STORE_DRIVER[[:space:]]*:' "$COMPOSE_FILE"; then
        echo "docker-compose.yml must not override STATE_STORE_DRIVER; use .env instead." >&2
        exit 1
    fi
    if grep -Eq 'OBJECT_STORAGE_DRIVER[[:space:]]*:' "$COMPOSE_FILE"; then
        echo "docker-compose.yml must not override OBJECT_STORAGE_DRIVER; use .env instead." >&2
        exit 1
    fi
fi
"$REPO_DIR/deploy/publish-image.sh" "$IMAGE_TAG"
"$REPO_DIR/deploy/deploy.sh" "$IMAGE_TAG"

echo
echo "Release complete: ${IMAGE_TAG}"
echo "Public health: https://api.industry.ygys30ds.cloud/api/v1/health"
