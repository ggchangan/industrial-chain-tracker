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

"$REPO_DIR/deploy/publish-image.sh" "$IMAGE_TAG"
"$REPO_DIR/deploy/deploy.sh" "$IMAGE_TAG"

echo
echo "Release complete: ${IMAGE_TAG}"
echo "Public health: https://api.industry.ygys30ds.cloud/api/v1/health"
