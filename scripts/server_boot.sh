#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
HTTP_ADDR="${LOGSCOPE_HTTP_ADDR:-0.0.0.0:3000}"
TCP_ADDR="${LOGSCOPE_TCP_ADDR:-127.0.0.1:9001}"
INPUT_FORMAT="${LOGSCOPE_FORMAT:-auto}"
WORKERS="${LOGSCOPE_WORKERS:-4}"
TOP_N="${LOGSCOPE_TOP_N:-10}"
DROP_STRATEGY="${LOGSCOPE_DROP_STRATEGY:-block}"
ERROR_RATE_THRESHOLD="${LOGSCOPE_ERROR_RATE_THRESHOLD:-0.20}"
ERROR_RATE_DURATION="${LOGSCOPE_ERROR_RATE_DURATION:-0}"
P95_THRESHOLD_MS="${LOGSCOPE_P95_THRESHOLD_MS:-120}"
P95_DURATION="${LOGSCOPE_P95_DURATION:-0}"

cd "${ROOT_DIR}"

exec "${ROOT_DIR}/target/release/server" \
  --addr "${HTTP_ADDR}" \
  --tcp "${TCP_ADDR}" \
  --format "${INPUT_FORMAT}" \
  --workers "${WORKERS}" \
  --top-n "${TOP_N}" \
  --drop-strategy "${DROP_STRATEGY}" \
  --error-rate-threshold "${ERROR_RATE_THRESHOLD}" \
  --error-rate-duration "${ERROR_RATE_DURATION}" \
  --p95-threshold-ms "${P95_THRESHOLD_MS}" \
  --p95-duration "${P95_DURATION}"
