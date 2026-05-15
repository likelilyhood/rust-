# 推荐演示数据集

## 一、最适合当前项目直接演示

### 1. 项目内置样例

最稳妥，建议优先用于答辩：

- `cases/generated/json_happy_path.jsonl`
- `cases/generated/json_error_spike.jsonl`
- `cases/generated/json_latency_spike.jsonl`
- `cases/generated/access_happy_path.log`
- `cases/generated/public_normalized_lambda.jsonl`
- `cases/generated/public_normalized_apache.jsonl`
- `cases/generated/public_normalized_elasticsearch.jsonl`

优点：

- 已兼容当前 parser
- 不会因为外部数据格式变化而翻车
- 适合动态演示模式

## 二、推荐公开数据

### 2. Kaggle Web Server Logs 10k

适合展示：

- 热门路径
- 状态码分布
- 错误率

链接：

- https://www.kaggle.com/datasets/adepvenugopal/webserverlogs10k

### 3. Rootly AI Labs logs-dataset

适合展示：

- 多日志类型兼容
- 合法化处理
- 异常样例提取

链接：

- https://github.com/Rootly-AI-Labs/logs-dataset

### 4. AWS Lambda structured logs 官方示例

适合展示：

- 云函数结构化日志
- JSON 字段兼容

链接：

- https://docs.aws.amazon.com/lambda/latest/dg/python-logging.html

### 5. Loghub

适合未来扩展：

- 异常检测
- 日志模板抽取
- 更丰富的公开研究数据

链接：

- https://github.com/logpai/loghub

## 三、答辩数据建议组合

### 最优组合

1. 项目内置错误突增样例
2. 项目内置延迟升高样例
3. Lambda 结构化日志
4. Apache / Access 日志

### 讲法建议

- 用内置样例做动态演示
- 用 Lambda 展示结构化兼容
- 用 Apache 展示传统日志兼容
- 用 Loghub 说明未来研究扩展方向
