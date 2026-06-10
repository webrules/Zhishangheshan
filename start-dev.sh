#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

export HOME="$PWD/.wrangler-home"
export XDG_CONFIG_HOME="$PWD/.wrangler-config"

npm run dev -- --host 127.0.0.1 --port 5173 &
vite_pid=$!

trap 'kill "$vite_pid" 2>/dev/null || true' EXIT INT TERM

exec npx wrangler pages dev --compatibility-date=2024-05-12 --port 8788 --proxy 5173
