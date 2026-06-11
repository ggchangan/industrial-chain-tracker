#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
COMPOSE_FILE="$REPO_DIR/deploy/docker-compose.yml"
ENV_FILE="$REPO_DIR/.env"
IMAGE_TAG="${1:-${IMAGE_TAG:-latest}}"

if docker info >/dev/null 2>&1; then
    DOCKER=(docker)
else
    DOCKER=(sudo docker)
fi

if ! "${DOCKER[@]}" compose version >/dev/null 2>&1; then
    echo "Docker Compose plugin is required." >&2
    echo "Ubuntu 24.04: sudo apt update && sudo apt install -y docker-compose-v2" >&2
    exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
    echo "Missing $ENV_FILE. Copy .env.example to .env and configure production secrets." >&2
    exit 1
fi

if ! grep -Eq '^ADMIN_PASSWORD=.{10,}$' "$ENV_FILE"; then
    echo "ADMIN_PASSWORD must contain at least 10 characters." >&2
    exit 1
fi

if ! grep -Eq '^ADMIN_SESSION_SECRET=.{32,}$' "$ENV_FILE"; then
    echo "ADMIN_SESSION_SECRET must contain at least 32 characters." >&2
    exit 1
fi

export IMAGE_TAG

echo "Deploying industrial-chain-tracker:${IMAGE_TAG}"
"${DOCKER[@]}" compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" pull
"${DOCKER[@]}" compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d --remove-orphans

for attempt in {1..20}; do
    if curl --fail --silent http://127.0.0.1:4173/api/v1/health >/dev/null; then
        echo "Deployment is healthy: ${IMAGE_TAG}"
        "${DOCKER[@]}" compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps
        exit 0
    fi
    sleep 2
done

echo "Health check failed. Recent logs:" >&2
"${DOCKER[@]}" compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" logs --tail=100 chain-tracker >&2
exit 1
