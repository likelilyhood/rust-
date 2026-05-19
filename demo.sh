#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
DEFAULT_TCP_ADDR="127.0.0.1:9001"

JSON_SAMPLE_FILES=(
  "cases/generated/json_happy_path.jsonl"
  "cases/generated/json_invalid_mixed.jsonl"
  "cases/generated/json_error_spike.jsonl"
  "cases/generated/json_latency_spike.jsonl"
  "cases/generated/json_burst_stress.jsonl"
  "cases/generated/json_alert_error_trigger.jsonl"
  "cases/generated/json_alert_latency_trigger.jsonl"
  "sample.log"
  "sample.jsonl"
  "cases/generated/public_normalized_lambda.jsonl"
  "cases/generated/public_normalized_apache.jsonl"
  "cases/generated/public_normalized_elasticsearch.jsonl"
)

ACCESS_SAMPLE_FILES=(
  "cases/generated/access_happy_path.log"
  "cases/generated/access_invalid_mixed.log"
  "sample_access.log"
)

print_help() {
  cat <<'EOF'
logscope demo helper

用法：
  ./demo.sh <command>

可用命令：
  basic           启动 JSON 基础演示
  access          启动 access 日志演示
  all-json        启动全部 JSON/JSONL 样例合并演示
  all-access      启动全部 access 样例合并演示
  normalize-public 将 public 原始日志合法化为 LogEvent JSONL
  public-normalized 启动 public 合法化样例演示
  invalid         启动非法日志混合演示
  access-invalid  启动 access 非法日志混合演示
  error-spike     启动错误突增样例演示
  latency-spike   启动延迟突增样例演示
  burst-stress    启动密集流量样例演示
  error-alert     启动错误率告警演示
  latency-alert   启动延迟告警演示
  tcp-server      启动 auto TCP 输入服务
  tcp-server-access 启动 access TCP 输入服务
  stream-json     按数量和间隔向 TCP 服务推送 JSON 样例
  stream-access   按数量和间隔向 TCP 服务推送 access 样例
  stream-file     按数量和间隔向 TCP 服务推送指定样例文件
  gen-wave        使用 generator 推送 wave_qps
  gen-error       使用 generator 推送 spike_error
  gen-latency     使用 generator 推送 spike_latency
  metrics         请求 /metrics
  alerts          请求 /alerts
  health          请求 /health
  help            显示帮助

示例：
  ./demo.sh basic
  ./demo.sh all-json
  ./demo.sh normalize-public
  ./demo.sh public-normalized
  ./demo.sh error-spike
  ./demo.sh latency-spike
  ./demo.sh burst-stress
  ./demo.sh tcp-server
  ./demo.sh stream-json 80 100
  ./demo.sh stream-file cases/generated/json_burst_stress.jsonl 40 150 127.0.0.1:9001
  ./demo.sh metrics
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
  cargo run -p generator --bin generator -- "$@"
}

normalize_public_samples() {
  cd "${ROOT_DIR}"
  mkdir -p cases/generated

  cargo run -p generator --bin normalize_public -- \
    --input cases/public/public_lambda_structured_log.json \
    --output cases/generated/public_normalized_lambda.jsonl \
    --format json
  cargo run -p generator --bin normalize_public -- \
    --input cases/public/public_apache_edge_cases.log \
    --output cases/generated/public_normalized_apache.jsonl \
    --format access
  cargo run -p generator --bin normalize_public -- \
    --input cases/public/public_elasticsearch_server_excerpt.log \
    --output cases/generated/public_normalized_elasticsearch.jsonl \
    --format auto
}

run_combined_server() {
  local label="$1"
  local format="$2"
  shift 2

  echo "==> 启动场景: ${label}"
  echo "==> 输入样例:"
  for file in "$@"; do
    echo "    - ${file}"
  done
  echo "==> 浏览器地址: http://127.0.0.1:3000"
  echo "==> 按 Ctrl + C 可停止当前服务"
  echo

  cd "${ROOT_DIR}"
  {
    for file in "$@"; do
      sed '/^[[:space:]]*$/d' "${file}"
    done
  } | cargo run -p server -- \
    --addr 127.0.0.1:3000 \
    --format "${format}" \
    --workers 4
}

stream_file() {
  local file="$1"
  local count="${2:-32}"
  local interval_ms="${3:-100}"
  local addr="${4:-${DEFAULT_TCP_ADDR}}"
  local host="${addr%:*}"
  local port="${addr##*:}"
  local sleep_seconds

  if [[ ! -f "${ROOT_DIR}/${file}" ]]; then
    echo "样例文件不存在: ${file}" >&2
    exit 1
  fi

  sleep_seconds="$(awk -v ms="${interval_ms}" 'BEGIN { printf "%.3f", ms / 1000 }')"
  lines=()
  while IFS= read -r line; do
    lines+=("${line}")
  done < <(sed '/^[[:space:]]*$/d' "${ROOT_DIR}/${file}")

  if [[ "${#lines[@]}" -eq 0 ]]; then
    echo "样例文件没有可推送的非空行: ${file}" >&2
    exit 1
  fi

  echo "==> 推送样例文件: ${file}"
  echo "==> 目标 TCP: ${addr}"
  echo "==> 推送行数: ${count}"
  echo "==> 间隔: ${interval_ms} ms"
  echo

  exec 3<>"/dev/tcp/${host}/${port}"
  for ((index = 0; index < count; index += 1)); do
    printf '%s\n' "${lines[index % ${#lines[@]}]}" >&3
    if (( index + 1 < count )); then
      sleep "${sleep_seconds}"
    fi
  done
  exec 3>&-

  echo "==> 推送完成"
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
  all-json)
    normalize_public_samples
    run_combined_server "全部 JSON/JSONL 样例合并演示" json "${JSON_SAMPLE_FILES[@]}"
    ;;
  all-access)
    run_combined_server "全部 access 样例合并演示" access "${ACCESS_SAMPLE_FILES[@]}"
    ;;
  normalize-public)
    normalize_public_samples
    ;;
  public-normalized)
    normalize_public_samples
    run_combined_server "public 原始日志合法化演示" json \
      "cases/generated/public_normalized_lambda.jsonl" \
      "cases/generated/public_normalized_apache.jsonl" \
      "cases/generated/public_normalized_elasticsearch.jsonl"
    ;;
  invalid)
    run_server "非法日志混合演示" \
      --addr 127.0.0.1:3000 \
      --file cases/generated/json_invalid_mixed.jsonl \
      --format json \
      --workers 4
    ;;
  access-invalid)
    run_server "access 非法日志混合演示" \
      --addr 127.0.0.1:3000 \
      --file cases/generated/access_invalid_mixed.log \
      --format access \
      --workers 4
    ;;
  error-spike)
    run_server "错误突增样例演示" \
      --addr 127.0.0.1:3000 \
      --file cases/generated/json_error_spike.jsonl \
      --format json \
      --workers 4 \
      --error-rate-threshold 0.2 \
      --error-rate-duration 0
    ;;
  latency-spike)
    run_server "延迟突增样例演示" \
      --addr 127.0.0.1:3000 \
      --file cases/generated/json_latency_spike.jsonl \
      --format json \
      --workers 4 \
      --p95-threshold-ms 120 \
      --p95-duration 0
    ;;
  burst-stress)
    run_server "密集流量样例演示" \
      --addr 127.0.0.1:3000 \
      --file cases/generated/json_burst_stress.jsonl \
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
      --format auto \
      --workers 4 \
      --error-rate-threshold 0.2 \
      --error-rate-duration 0 \
      --p95-threshold-ms 120 \
      --p95-duration 0
    ;;
  tcp-server-access)
    run_server "access TCP 推流演示服务" \
      --addr 127.0.0.1:3000 \
      --tcp 127.0.0.1:9001 \
      --format access \
      --workers 4
    ;;
  stream-json)
    stream_file "cases/generated/json_burst_stress.jsonl" "${2:-64}" "${3:-120}" "${4:-${DEFAULT_TCP_ADDR}}"
    ;;
  stream-access)
    stream_file "cases/generated/access_happy_path.log" "${2:-32}" "${3:-180}" "${4:-${DEFAULT_TCP_ADDR}}"
    ;;
  stream-file)
    if [[ $# -lt 2 ]]; then
      echo "用法: ./demo.sh stream-file <file> [count] [interval-ms] [host:port]" >&2
      exit 1
    fi
    stream_file "$2" "${3:-32}" "${4:-120}" "${5:-${DEFAULT_TCP_ADDR}}"
    ;;
  gen-wave)
    run_generator "wave_qps 推流" \
      --mode wave_qps \
      --count 32 \
      --interval-ms 80 \
      --push 127.0.0.1:9001
    ;;
  gen-error)
    run_generator "spike_error 推流" \
      --mode spike_error \
      --count 32 \
      --interval-ms 80 \
      --push 127.0.0.1:9001
    ;;
  gen-latency)
    run_generator "spike_latency 推流" \
      --mode spike_latency \
      --count 32 \
      --interval-ms 80 \
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
