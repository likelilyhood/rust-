# logscope 实时日志分析平台

`logscope` 是一个使用 Rust 构建的跨平台实时日志分析课程项目。系统可以从标准输入、日志文件或 TCP 端口接收日志流，对日志进行解析、聚合和统计，并通过 HTTP API 与网页仪表盘实时展示分析结果。

项目目标不是做一个超大而全的日志平台，而是做一个适合课程大作业展示、结构清晰、能稳定跑起来、指标会实时变化的完整系统。

## 一、项目特性

- 使用 Rust workspace 组织代码，模块边界清晰
- 支持 `stdin`、文件输入、TCP 输入三种日志来源
- 支持两种日志格式：
  - JSON Lines
  - 简化版 access log
- 支持并发解析 pipeline，可配置 `--workers`
- 支持背压与丢弃策略：
  - `block`
  - `drop_newest`
  - `drop_oldest`
  - `sample_1_in_n`
- 支持多时间窗口指标：
  - `10s`
  - `1m`
  - `5m`
- 支持延迟分位数统计：
  - `p50`
  - `p95`
  - `p99`
- 支持基础告警：
  - 错误率告警
  - p95 延迟告警
- 自带静态 dashboard，可直接打开浏览器演示
- 提供日志生成器 `generator`，便于答辩时制造流量波动与异常场景

## 二、项目结构

```text
logscope/
├── crates/
│   ├── common/        # 共享数据结构
│   ├── parser/        # 日志解析器
│   ├── aggregator/    # 指标聚合与窗口统计
│   ├── server/        # HTTP 服务、输入管线、告警
│   └── generator/     # 日志生成器
├── web/               # 前端仪表盘
├── sample.log         # JSON 样例日志
├── sample_access.log  # access 样例日志
├── report.md          # 项目报告
└── README.md
```

## 三、核心模块说明

### 1. `common`

定义全项目共享的数据结构，例如：

- `LogEvent`
- `MetricsResponse`
- `WindowMetrics`
- `PipelineStats`
- `Alert`

### 2. `parser`

负责把原始日志行转换为结构化事件。

当前支持：

- `json`：解析 JSON Lines
- `access`：解析简化版访问日志

命令行参数：

```bash
--format json
--format access
```

### 3. `aggregator`

负责维护运行时指标状态，包括：

- 总请求数 `total`
- 有效日志数 `valid`
- 无效日志数 `invalid`
- 错误数 `errors`
- 错误率 `error_rate`
- 平均延迟 `latency_avg_ms`
- 最大延迟 `latency_max_ms`
- 延迟分位数 `p50 / p95 / p99`
- `status_counts`
- `top_paths`
- `10s / 1m / 5m` 窗口指标

### 4. `server`

负责系统运行主流程：

- 接收输入
- 将原始日志送入有界队列
- 多 worker 并发解析
- 单聚合任务更新指标
- 提供 HTTP API
- 托管前端静态页面
- 维护基础告警状态

### 5. `generator`

用于模拟流量和异常场景，便于展示系统效果。

支持模式：

- `normal`
- `spike_error`
- `spike_latency`
- `wave_qps`

## 四、运行方式

### 1. 基础运行

使用 JSON 文件输入：

```bash
cargo run -p server -- --addr 127.0.0.1:3000 --file sample.log --format json --workers 4
```

使用 access log 输入：

```bash
cargo run -p server -- --addr 127.0.0.1:3000 --file sample_access.log --format access --workers 4
```

使用标准输入：

```bash
cat sample.log | cargo run -p server -- --addr 127.0.0.1:3000
```

启动后访问：

- [http://127.0.0.1:3000](http://127.0.0.1:3000)
- [http://127.0.0.1:3000/health](http://127.0.0.1:3000/health)
- [http://127.0.0.1:3000/metrics](http://127.0.0.1:3000/metrics)
- [http://127.0.0.1:3000/alerts](http://127.0.0.1:3000/alerts)

### 2. TCP 输入模式

先启动服务端监听 TCP：

```bash
cargo run -p server -- --addr 127.0.0.1:3000 --tcp 127.0.0.1:9001 --workers 4
```

然后用生成器推送日志：

```bash
cargo run -p generator -- --mode wave_qps --count 32 --push 127.0.0.1:9001
```

## 五、常用参数

### `server`

```bash
--addr 127.0.0.1:3000
--file sample.log
--tcp 127.0.0.1:9001
--format json|access
--top-n 10
--workers 4
--drop-strategy block|drop_newest|drop_oldest|sample_1_in_n
--sample-n 10
--error-rate-threshold 0.2
--error-rate-duration 10
--p95-threshold-ms 120
--p95-duration 30
```

### `generator`

```bash
--mode normal|spike_error|spike_latency|wave_qps
--count 32
--push 127.0.0.1:9001
```

## 六、API 说明

### `GET /health`

返回服务健康状态：

```text
ok
```

### `GET /metrics`

返回当前指标快照，主要包括：

- 全局指标
- `status_counts`
- `top_paths`
- `pipeline`
- `windows["10s"]`
- `windows["1m"]`
- `windows["5m"]`

示例字段：

```json
{
  "uptime_secs": 12,
  "total": 100,
  "valid": 96,
  "invalid": 4,
  "errors": 10,
  "error_rate": 0.104,
  "latency_p50_ms": 50,
  "latency_p95_ms": 150,
  "latency_p99_ms": 200,
  "pipeline": {
    "queue_capacity": 1024,
    "queue_len": 0,
    "workers": 4,
    "parse_failures": 4,
    "dropped_lines": 0,
    "drop_rate": 0.0
  }
}
```

### `GET /alerts`

返回当前活动告警列表：

```json
{
  "active": []
}
```

## 七、质量保证

项目当前通过以下质量检查：

```bash
cargo fmt --all
cargo clippy --workspace --all-targets --all-features -- -D warnings
cargo test --workspace
```

同时已经进行过以下实际运行验证：

- JSON 文件输入验证
- access 文件输入验证
- TCP 输入验证
- generator 推流验证
- `/metrics` 与 `/alerts` 接口验证
- dashboard 页面展示验证

## 八、适合答辩展示的演示流程

### 场景 1：基础运行

1. 启动 server，读取 `sample.log`
2. 打开 dashboard
3. 展示 `/metrics` 中的 `total / errors / top_paths / status_counts`

### 场景 2：异常流量演示

1. 启动 TCP 模式 server
2. 用 `generator --mode spike_error` 推送日志
3. 观察错误率上升
4. 展示 `/alerts` 中的活动告警

### 场景 3：性能波动演示

1. 使用 `generator --mode spike_latency`
2. 展示 `1m` 窗口里的 `p95 / p99`
3. 说明为什么分位数比平均值更能反映系统抖动

## 九、项目亮点

- 不是单纯做“读文件然后统计”，而是实现了真实的流式处理结构
- 同时支持多输入源、多解析器和多时间窗口
- 具备并发解析能力和基础背压策略
- 具备告警与生成器，适合完整演示
- 代码按 workspace 拆分，利于团队协作和后续扩展

## 十、后续可扩展方向

- 增加更精细的窗口算法
- 增加服务维度、方法维度统计
- 增加 WebSocket/SSE 实时推送
- 增加更多日志格式解析器
- 增加持久化和历史查询能力

## 十一、课程说明

本项目适合作为系统编程、Rust 课程、大数据日志分析、软件工程课程的大作业展示项目。它强调：

- 工程结构清晰
- 模块边界明确
- 功能可运行可验证
- 展示效果直观

如果需要更详细的设计说明、测试过程和分工描述，请查看 [report.md](/Users/hood/R语言大作业/report.md)。
