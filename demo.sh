#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

print_help() {
  cat <<'EOF'
logscope demo helper

用法：
  ./demo.sh <command>

可用命令：
  basic           启动 JSON 基础演示
  access          启动 access 日志演示
  invalid         启动非法日志混合演示
  error-alert     启动错误率告警演示
  latency-alert   启动延迟告警演示
  tcp-server      启动 TCP 输入服务
  gen-wave        使用 generator 推送 wave_qps
  gen-error       使用 generator 推送 spike_error
  gen-latency     使用 generator 推送 spike_latency
  metrics         请求 /metrics
  alerts          请求 /alerts
  health          请求 /health
  help            显示帮助

示例：
  ./demo.sh basic
  ./demo.sh metrics
  ./demo.sh tcp-server
  ./demo.sh gen-error
EOF
}

run_server() {
  local label="$1"
  shift

  echo "==> 启动场景: ${label}"
  echo "==> 工作目录: ${ROOT_DIR}"
  echo "==> 浏览器地址: http://127.0.0.1:3000"
  echo "==> 按 Ctrl + C 可停止当前服务"
  echo

  cd "${ROOT_DIR}"
  cargo run -p server -- "$@"
}

run_generator() {
  local label="$1"
  shift

  echo "==> 推送场景: ${label}"
  echo

  cd "${ROOT_DIR}"
  cargo run -p generator -- "$@"
}

curl_endpoint() {
  local endpoint="$1"
  echo "==> 请求 http://127.0.0.1:3000/${endpoint}"
  echo
  curl "http://127.0.0.1:3000/${endpoint}"
  echo
}

command="${1:-help}"

case "${command}" in
  basic)
    run_server "JSON 基础演示" \
      --addr 127.0.0.1:3000 \
      --file cases/generated/json_happy_path.jsonl \
      --format json \
      --workers 4
    ;;
  access)
    run_server "access 日志演示" \
      --addr 127.0.0.1:3000 \
      --file cases/generated/access_happy_path.log \
      --format access \
      --workers 4
    ;;
  invalid)
    run_server "非法日志混合演示" \
      --addr 127.0.0.1:3000 \
      --file cases/generated/json_invalid_mixed.jsonl \
      --format json \
      --workers 4
    ;;
  error-alert)
    run_server "错误率告警演示" \
      --addr 127.0.0.1:3000 \
      --file cases/generated/json_alert_error_trigger.jsonl \
      --format json \
      --workers 4 \
      --error-rate-threshold 0.2 \
      --error-rate-duration 0
    ;;
  latency-alert)
    run_server "延迟告警演示" \
      --addr 127.0.0.1:3000 \
      --file cases/generated/json_alert_latency_trigger.jsonl \
      --format json \
      --workers 4 \
      --p95-threshold-ms 120 \
      --p95-duration 0
    ;;
  tcp-server)
    run_server "TCP 推流演示服务" \
      --addr 127.0.0.1:3000 \
      --tcp 127.0.0.1:9001 \
      --workers 4
    ;;
  gen-wave)
    run_generator "wave_qps 推流" \
      --mode wave_qps \
      --count 32 \
      --push 127.0.0.1:9001
    ;;
  gen-error)
    run_generator "spike_error 推流" \
      --mode spike_error \
      --count 32 \
      --push 127.0.0.1:9001
    ;;
  gen-latency)
    run_generator "spike_latency 推流" \
      --mode spike_latency \
      --count 32 \
      --push 127.0.0.1:9001
    ;;
  metrics)
    curl_endpoint "metrics"
    ;;
  alerts)
    curl_endpoint "alerts"
    ;;
  health)
    curl_endpoint "health"
    ;;
  help|-h|--help)
    print_help
    ;;
  *)
    echo "未知命令: ${command}" >&2
    echo >&2
    print_help
    exit 1
    ;;
esac
