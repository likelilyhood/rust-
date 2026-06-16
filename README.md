# logscope

`logscope` 是一个使用 Rust 构建的实时日志分析项目。它支持从 `stdin`、日志文件、TCP 推流和 HTTP 注入接收日志，对日志进行解析、聚合、统计和告警，并通过网页仪表盘实时展示结果。

这个项目既适合课程大作业和答辩展示，也适合作为轻量级日志观测系统原型继续扩展。

## 快速开始

最适合第一次上手的方式有两种。

### 1. 直接跑内置样例

```bash
./demo.sh basic
```

或者：

```bash
./demo.sh error-spike
./demo.sh latency-spike
```

启动后访问：

- [http://127.0.0.1:3000](http://127.0.0.1:3000)
- [http://127.0.0.1:3000/health](http://127.0.0.1:3000/health)
- [http://127.0.0.1:3000/metrics](http://127.0.0.1:3000/metrics)
- [http://127.0.0.1:3000/alerts](http://127.0.0.1:3000/alerts)

### 2. 跑实时推流演示

先启动 TCP 演示服务：

```bash
./demo.sh tcp-server
```

再用生成器推送动态流量：

```bash
./demo.sh gen-error
./demo.sh gen-latency
./demo.sh gen-wave
```

这组命令适合现场答辩，因为可以直接看到：

- 错误率变化
- P95 延迟变化
- 活动告警
- 前端仪表盘刷新

## 项目特性

- Rust workspace 组织代码，模块边界清晰
- 支持 `stdin`、文件、TCP、HTTP `/ingest` 四种输入方式
- 支持 `json`、`access` 和 `auto` 解析模式
- `auto` 支持兼容：
  - 标准 JSON Lines
  - 泛化 JSON 字段
  - Apache combined
  - Lambda 结构化 JSON
  - Elasticsearch 服务日志
- 支持多 worker 并发解析
- 支持有界队列和基础背压/丢弃策略
- 支持 `10s / 1m / 5m` 窗口统计
- 支持 `p50 / p95 / p99` 延迟分位数
- 支持错误率和 P95 延迟告警
- 支持网页仪表盘、中英文切换、演示模式和实时生成器
- 支持在线导入 `/imports` 和实时注入 `/ingest`
- 支持 public 原始日志合法化为统一 `LogEvent JSONL`

## 常用演示命令

### 样例场景

```bash
./demo.sh basic
./demo.sh access
./demo.sh all-json
./demo.sh all-access
./demo.sh invalid
./demo.sh access-invalid
./demo.sh error-spike
./demo.sh latency-spike
./demo.sh burst-stress
./demo.sh error-alert
./demo.sh latency-alert
```

### 实时流式演示

```bash
./demo.sh tcp-server
./demo.sh gen-error
./demo.sh gen-latency
./demo.sh gen-wave
./demo.sh stream-json 80 100
./demo.sh stream-file cases/generated/json_burst_stress.jsonl 40 150 127.0.0.1:9001
```

### access 流式演示

```bash
./demo.sh tcp-server-access
./demo.sh stream-access 30 180
```

### public 日志合法化

```bash
./demo.sh normalize-public
./demo.sh public-normalized
```

生成文件位于：

- `cases/generated/public_normalized_lambda.jsonl`
- `cases/generated/public_normalized_apache.jsonl`
- `cases/generated/public_normalized_elasticsearch.jsonl`

### 调试接口

```bash
./demo.sh health
./demo.sh metrics
./demo.sh alerts
./scripts/regression_check.sh
```

## 手动运行

### 文件输入

JSON 文件：

```bash
cargo run -p server -- --addr 127.0.0.1:3000 --file sample.log --format json --workers 4
```

access 日志：

```bash
cargo run -p server -- --addr 127.0.0.1:3000 --file sample_access.log --format access --workers 4
```

标准输入：

```bash
cat sample.log | cargo run -p server -- --addr 127.0.0.1:3000
```

### TCP 输入

```bash
cargo run -p server -- --addr 127.0.0.1:3000 --tcp 127.0.0.1:9001 --workers 4
```

然后推送：

```bash
cargo run -p generator -- --mode wave_qps --count 32 --push 127.0.0.1:9001
```

### HTTP 实时注入

```bash
curl -X POST http://127.0.0.1:3000/ingest \
  -H 'Content-Type: application/json' \
  -d '{"content":"{\"path\":\"/api/orders\",\"status\":200,\"latency_ms\":42}\n{\"path\":\"/api/orders/checkout/payment/callback\",\"status\":503,\"latency_ms\":280}"}'
```

### 在线导入分析

```bash
curl -X POST http://127.0.0.1:3000/imports \
  -H 'Content-Type: application/json' \
  -d '{"format":"auto","content":"{\"path\":\"/api/orders\",\"status\":200,\"latency_ms\":42}\n{\"path\":\"/api/orders/checkout/payment/callback\",\"status\":502,\"latency_ms\":320}"}'
```

## 服务器部署

最简单的部署方式：

```bash
git clone https://github.com/likelilyhood/rust-.git /opt/logscope
cd /opt/logscope
cargo build --release -p server
chmod +x scripts/server_boot.sh
./scripts/server_boot.sh
```

如果需要开机自启，可使用仓库内模板：

```bash
cp deploy/logscope.service.example /etc/systemd/system/logscope.service
systemctl daemon-reload
systemctl enable --now logscope
systemctl status logscope --no-pager
```

默认建议：

- 公网只开放 `80/443` 或 `3000`
- `9001` 仅在需要外部机器直接 TCP 推流时开放
- 若使用反向代理，保留 `3000` 仅本机监听会更稳妥

## 主要接口

### `GET /health`

返回：

```text
ok
```

### `GET /metrics`

返回当前运行时指标，包含：

- 全局计数
- 状态码统计
- 热门路径
- pipeline 状态
- `10s / 1m / 5m` 窗口指标

### `GET /alerts`

返回当前活动告警：

```json
{
  "active": []
}
```

### `POST /imports`

对一段日志文本做一次性分析，不会覆盖正在运行的实时指标。

### `POST /ingest`

把日志实时注入当前运行中的 pipeline，适合前端实时生成器、脚本推送或后续接真实服务。

## 仪表盘能力

网页仪表盘除了基础指标，还支持：

- 健康评分
- 状态分布
- 输入趋势
- 热门路径
- 异常明细
- 服务热力榜
- 事件回放
- 对比分析
- 历史快照
- 报告导出
- 演示模式
- 实时生成器
- 中英文切换

## 项目结构

```text
logscope/
├── crates/
│   ├── common/        # 共享数据结构
│   ├── parser/        # 日志解析器
│   ├── aggregator/    # 指标聚合与窗口统计
│   ├── server/        # HTTP 服务、输入管线、告警
│   └── generator/     # 日志生成器
├── web/               # 前端仪表盘
├── cases/             # 样例与 public 日志
├── docs/              # 项目文档与兼容记忆
├── ppt_assets/        # 固定答辩素材库
├── sample.log
├── sample_access.log
├── report.md
└── README.md
```

## 常用参数

### `server`

```bash
--addr 127.0.0.1:3000
--file sample.log
--tcp 127.0.0.1:9001
--format auto|json|access
--top-n 10
--workers 4
--drop-strategy block|drop_newest|drop_oldest|sample_1_in_n
--sample-n 10
--error-rate-threshold 0.2
--error-rate-duration 0
--p95-threshold-ms 120
--p95-duration 0
```

### `generator`

```bash
--mode normal|spike_error|spike_latency|wave_qps
--count 32
--interval-ms 80
--push 127.0.0.1:9001
```

## 质量检查

当前建议使用以下检查：

```bash
bash -n demo.sh
node --check web/app.js
cargo test
./scripts/regression_check.sh
```

此外，项目已经实际验证过：

- 文件输入
- TCP 推流
- `/imports`
- `/ingest`
- `/metrics`
- `/alerts`
- 前端首页和告警展示

## 固定材料

### 答辩素材库

- [ppt_assets/midterm_defense](/Users/hood/R语言大作业/ppt_assets/midterm_defense)

这个目录默认作为中期答辩、结题答辩和后续展示材料的统一来源。

### 变更兼容记忆

- [docs/CHANGE_COMPAT_MEMORY.md](/Users/hood/R语言大作业/docs/CHANGE_COMPAT_MEMORY.md)

后续每次功能更新后，默认要：

- 兼容之前已经公开的命令与演示脚本
- 回归验证关键命令链路
- 同步更新前端逻辑
- 同步更新答辩素材库与说明文档

## 适合答辩的演示路径

1. 启动 `./demo.sh tcp-server`
2. 打开仪表盘首页
3. 运行 `./demo.sh gen-error`
4. 展示错误率、P95 和活动告警
5. 再运行 `./demo.sh gen-latency`
6. 展示延迟抖动和事件回放
7. 最后展示在线导入、报告导出和历史快照

## 参考资料

- 更详细的实验说明和报告： [report.md](/Users/hood/R语言大作业/report.md)
- 样例说明： [cases/README.md](/Users/hood/R语言大作业/cases/README.md)
