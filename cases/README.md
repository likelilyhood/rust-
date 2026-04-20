# 用例说明

本目录收集了两类日志用例：

- `generated/`：针对当前 `logscope` 项目格式专门制作的演示与测试样例
- `public/`：从公开来源下载的原始日志或结构化日志样例

## 一、generated 目录

### `json_happy_path.jsonl`

适合演示：

- 基础运行
- `/metrics` 的正常统计
- `top_paths` 和 `status_counts`

### `json_error_spike.jsonl`

适合演示：

- 错误率上升
- `/alerts` 中错误率告警
- 窗口统计中的异常波动

### `json_latency_spike.jsonl`

适合演示：

- p95 / p99 延迟明显升高
- 平均值与分位数的差别

### `json_invalid_mixed.jsonl`

适合演示：

- 非法日志不会导致系统崩溃
- `invalid` 与 `parse_failures` 计数变化

### `json_burst_stress.jsonl`

适合演示：

- 较密集的输入
- pipeline、窗口指标和热点路径变化

### `json_alert_error_trigger.jsonl`

适合演示：

- 错误率阈值触发

### `json_alert_latency_trigger.jsonl`

适合演示：

- p95 延迟阈值触发

### `access_happy_path.log`

适合演示：

- `--format access` 模式
- access 格式解析能力

### `access_invalid_mixed.log`

适合演示：

- access 模式下的非法行容错

## 二、public 目录

### `public_lambda_structured_log.json`

来源：

- https://gist.github.com/leroychan/20e0be03ba707dc89b2b5b3fcdc77b3e

说明：

- 一个公开的结构化 JSON 日志样例
- 适合参考真实云函数日志结构

### `public_apache_edge_cases.log`

来源：

- https://gist.github.com/jeremiahshirk/2026661

说明：

- Apache access log 的边界样例
- 适合后续扩展解析器或做负例参考

### `public_elasticsearch_server_excerpt.log`

来源：

- https://gist.github.com/syedsfayaz/4c53a63e7127e3506b1064b58bb4cfad

说明：

- Elasticsearch 服务日志公开样例节选
- 适合展示真实服务日志的复杂度

## 三、推荐演示命令

### 1. JSON 基础演示

```bash
cargo run -p server -- --addr 127.0.0.1:3000 --file cases/generated/json_happy_path.jsonl --format json --workers 4
```

### 2. access 日志演示

```bash
cargo run -p server -- --addr 127.0.0.1:3000 --file cases/generated/access_happy_path.log --format access --workers 4
```

### 3. 错误率告警演示

```bash
cargo run -p server -- --addr 127.0.0.1:3000 --file cases/generated/json_alert_error_trigger.jsonl --error-rate-threshold 0.2 --error-rate-duration 0
```

### 4. 延迟告警演示

```bash
cargo run -p server -- --addr 127.0.0.1:3000 --file cases/generated/json_alert_latency_trigger.jsonl --p95-threshold-ms 120 --p95-duration 0
```
