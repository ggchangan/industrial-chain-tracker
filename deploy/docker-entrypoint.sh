#!/bin/sh
set -eu

if [ -n "${DATA_DIR:-}" ]; then
  mkdir -p "$DATA_DIR"
  chown -R node:node "$DATA_DIR"
fi

exec su-exec node "$@"
