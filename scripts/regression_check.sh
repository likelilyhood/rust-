#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
HTTP_PORT="${HTTP_PORT:-3100}"
TCP_PORT="${TCP_PORT:-9100}"
SERVER_ADDR="127.0.0.1:${HTTP_PORT}"
TCP_ADDR="127.0.0.1:${TCP_PORT}"
SERVER_LOG="${TMPDIR:-/tmp}/logscope-regression-server.log"
SERVER_PID=""

cleanup() {
  if [[ -n "${SERVER_PID}" ]] && kill -0 "${SERVER_PID}" 2>/dev/null; then
    kill "${SERVER_PID}" >/dev/null 2>&1 || true
    wait "${SERVER_PID}" 2>/dev/null || true
  fi
}

trap cleanup EXIT

step() {
  printf '\n==> %s\n' "$1"
}

assert_contains() {
  local haystack="$1"
  local needle="$2"
  local message="$3"
  if [[ "${haystack}" != *"${needle}"* ]]; then
    printf 'FAILED: %s\n' "${message}" >&2
    printf 'Expected to find: %s\n' "${needle}" >&2
    exit 1
  fi
}

step "静态检查"
cd "${ROOT_DIR}"
bash -n demo.sh
node --check web/app.js
cargo test >/dev/null

step "启动回归服务"
: > "${SERVER_LOG}"
cargo run -p server -- \
  --addr "${SERVER_ADDR}" \
  --tcp "${TCP_ADDR}" \
  --format auto \
  --workers 4 \
  --error-rate-threshold 0.2 \
  --error-rate-duration 0 \
  --p95-threshold-ms 120 \
  --p95-duration 0 \
  >"${SERVER_LOG}" 2>&1 &
SERVER_PID=$!

for _ in {1..40}; do
  if curl -fsS "http://${SERVER_ADDR}/health" >/dev/null 2>&1; then
    break
  fi
  sleep 0.25
done

if ! curl -fsS "http://${SERVER_ADDR}/health" >/dev/null 2>&1; then
  printf 'FAILED: server did not become healthy\n' >&2
  cat "${SERVER_LOG}" >&2
  exit 1
fi

step "基础接口"
health="$(curl -fsS "http://${SERVER_ADDR}/health")"
metrics="$(curl -fsS "http://${SERVER_ADDR}/metrics")"
alerts="$(curl -fsS "http://${SERVER_ADDR}/alerts")"
assert_contains "${health}" "ok" "health endpoint"
assert_contains "${metrics}" "\"windows\"" "metrics endpoint"
assert_contains "${alerts}" "\"active\"" "alerts endpoint"

step "在线导入 /imports"
import_payload='{"format":"auto","content":"{\"path\":\"/api/orders\",\"status\":200,\"latency_ms\":42}\n{\"path\":\"/api/orders/checkout/payment/callback\",\"status\":502,\"latency_ms\":320}"}'
import_result="$(curl -fsS -X POST "http://${SERVER_ADDR}/imports" -H 'Content-Type: application/json' -d "${import_payload}")"
assert_contains "${import_result}" "\"lines\":2" "/imports line count"
assert_contains "${import_result}" "\"errors\":1" "/imports error count"

step "HTTP 实时注入 /ingest"
ingest_payload='{"content":"{\"path\":\"/api/orders\",\"status\":200,\"latency_ms\":42}\n{\"path\":\"/api/orders/checkout/payment/callback\",\"status\":503,\"latency_ms\":280}"}'
ingest_result="$(curl -fsS -X POST "http://${SERVER_ADDR}/ingest" -H 'Content-Type: application/json' -d "${ingest_payload}")"
assert_contains "${ingest_result}" "\"accepted_lines\":2" "/ingest accepted lines"
sleep 1
metrics_after_ingest="$(curl -fsS "http://${SERVER_ADDR}/metrics")"
assert_contains "${metrics_after_ingest}" "\"total\":2" "ingest metrics total"

step "generator 错误流"
cargo run -p generator --bin generator -- --mode spike_error --count 32 --interval-ms 80 --push "${TCP_ADDR}" >/dev/null
sleep 1
alerts_after_error="$(curl -fsS "http://${SERVER_ADDR}/alerts")"
assert_contains "${alerts_after_error}" "\"error_rate\"" "error alert"

step "generator 延迟流"
cargo run -p generator --bin generator -- --mode spike_latency --count 32 --interval-ms 80 --push "${TCP_ADDR}" >/dev/null
sleep 1
alerts_after_latency="$(curl -fsS "http://${SERVER_ADDR}/alerts")"
assert_contains "${alerts_after_latency}" "\"p95_latency_ms\"" "latency alert"

step "generator 波动流"
cargo run -p generator --bin generator -- --mode wave_qps --count 32 --interval-ms 80 --push "${TCP_ADDR}" >/dev/null
sleep 1
metrics_after_wave="$(curl -fsS "http://${SERVER_ADDR}/metrics")"
assert_contains "${metrics_after_wave}" "\"qps\"" "wave metrics qps"

step "前端根页面"
root_html="$(curl -fsS "http://${SERVER_ADDR}/")"
assert_contains "${root_html}" "<title>logscope" "root html title"

printf '\nPASS: regression check completed for %s and %s\n' "${SERVER_ADDR}" "${TCP_ADDR}"
