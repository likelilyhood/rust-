const ids = {
  total: document.getElementById("total"),
  valid: document.getElementById("valid"),
  invalid: document.getElementById("invalid"),
  errors: document.getElementById("errors"),
  errorRate: document.getElementById("error-rate"),
  latencyAvg: document.getElementById("latency-avg"),
  latencyP50: document.getElementById("latency-p50"),
  latencyP95: document.getElementById("latency-p95"),
  latencyP99: document.getElementById("latency-p99"),
  latencyPeak: document.getElementById("latency-peak"),
  latencyMax: document.getElementById("latency-max"),
  windowGrid: document.getElementById("window-grid"),
  statusChart: document.getElementById("status-chart"),
  pathsChart: document.getElementById("paths-chart"),
  pipelineStats: document.getElementById("pipeline-stats"),
  pipelineKicker: document.getElementById("pipeline-kicker"),
  pipelineTitle: document.getElementById("pipeline-title"),
  pipelineNote: document.getElementById("pipeline-note"),
  alertsPanel: document.getElementById("alerts-panel"),
  refreshStatus: document.getElementById("refresh-status"),
  languageButtons: document.querySelectorAll("[data-lang-option]"),
  importFormat: document.getElementById("import-format"),
  importFile: document.getElementById("import-file"),
  importContent: document.getElementById("import-content"),
  importSubmit: document.getElementById("import-submit"),
  importLive: document.getElementById("import-live"),
  importStatus: document.getElementById("import-status"),
  healthRing: document.getElementById("health-ring"),
  healthScore: document.getElementById("health-score"),
  validRatio: document.getElementById("valid-ratio"),
  errorPressure: document.getElementById("error-pressure"),
  trendQps: document.getElementById("trend-qps"),
  trafficSparkline: document.getElementById("traffic-sparkline"),
  statusDonut: document.getElementById("status-donut"),
  statusLegend: document.getElementById("status-legend"),
  sparklineCard: document.querySelector(".sparkline-card"),
  incidentBanner: document.getElementById("incident-banner"),
  incidentTitle: document.getElementById("incident-title"),
  incidentMessage: document.getElementById("incident-message"),
  incidentMeta: document.getElementById("incident-meta"),
  pathTooltip: document.getElementById("path-tooltip"),
  demoSampleButtons: document.querySelectorAll("[data-demo-sample]"),
  demoPlay: document.getElementById("demo-play"),
  demoStop: document.getElementById("demo-stop"),
  demoStageLabel: document.getElementById("demo-stage-label"),
  demoStageText: document.getElementById("demo-stage-text"),
  demoStageProgress: document.getElementById("demo-stage-progress"),
  demoTimelineItems: document.querySelectorAll("[data-demo-step]"),
  anomaliesPanel: document.getElementById("anomalies-panel"),
  exportMarkdown: document.getElementById("export-markdown"),
  exportJson: document.getElementById("export-json"),
  reportPreview: document.getElementById("report-preview"),
  insightScore: document.getElementById("insight-score"),
  insightHeadline: document.getElementById("insight-headline"),
  insightSummary: document.getElementById("insight-summary"),
  insightActions: document.getElementById("insight-actions"),
  servicesPanel: document.getElementById("services-panel"),
  replayStream: document.getElementById("replay-stream"),
  appShell: document.querySelector(".shell"),
  bigScreenToggle: document.getElementById("big-screen-toggle"),
  viewModeButtons: document.querySelectorAll("[data-view-mode]"),
  compareSave: document.getElementById("compare-save"),
  compareClear: document.getElementById("compare-clear"),
  comparePanel: document.getElementById("compare-panel"),
  historyPanel: document.getElementById("history-panel"),
};

const I18N = {
  zh: {
    "app.title": "logscope 仪表盘",
    "hero.subtitle": "实时 JSONL 日志分析，支持滚动窗口、分位数统计、pipeline 遥测和告警面板。",
    "status.waiting": "等待指标...",
    "status.updated": "已更新",
    "status.refreshFailed": "刷新失败",
    "metric.total": "总行数",
    "metric.valid": "有效事件",
    "metric.invalid": "无效行",
    "metric.errors": "错误数 (5xx)",
    "metric.errorRate": "错误率",
    "metric.avgLatency": "平均延迟",
    "metric.maxLatency": "最大延迟",
    "latency.kicker": "延迟分布",
    "latency.title": "分位数与峰值",
    "latency.note": "仪表盘会展示可用的延迟分位数字段，并在旧指标结构下保持兼容。",
    "latency.p50": "P50 延迟",
    "latency.p95": "P95 延迟",
    "latency.p99": "P99 延迟",
    "windows.kicker": "滚动窗口",
    "windows.title": "10 秒、1 分钟和 5 分钟视图",
    "windows.note": "每张卡片都已接入较完整的指标结构，也会兼容服务器只返回旧版 recent_60s 数据的情况。",
    "import.kicker": "在线导入",
    "import.title": "粘贴或选择日志文件",
    "import.note": "导入结果会临时渲染到当前仪表盘，不会覆盖正在运行的实时指标。",
    "import.format": "日志格式",
    "import.file": "样本文件",
    "import.submit": "导入分析",
    "import.live": "恢复实时",
    "import.placeholder": "粘贴 JSON Lines 或 access 日志内容",
    "import.idle": "等待导入...",
    "import.loadingFile": "正在读取文件...",
    "import.readyFile": "文件已读取，可开始分析。",
    "import.empty": "请先粘贴日志内容或选择文件。",
    "import.analyzing": "正在分析导入日志...",
    "import.done": "导入完成",
    "import.lines": "行",
    "import.failed": "导入失败",
    "import.liveMode": "已恢复实时指标。",
    "sample.error": "错误突增样例",
    "sample.apache": "Apache 样例",
    "sample.lambda": "Lambda 样例",
    "demo.kicker": "演示模式",
    "demo.title": "一键播放故障演化",
    "demo.note": "自动播放正常流量、错误突增、延迟升高和恢复四个阶段，适合答辩现场展示。",
    "demo.play": "开始演示",
    "demo.stop": "停止",
    "demo.idle": "等待开始",
    "demo.normal": "正常流量",
    "demo.normalText": "系统处于健康状态，错误率和延迟保持低位。",
    "demo.error": "错误突增",
    "demo.errorText": "订单支付回调出现 5xx，健康评分下滑并触发告警展示。",
    "demo.latency": "延迟升高",
    "demo.latencyText": "搜索和库存路径变慢，P95/P99 延迟明显升高。",
    "demo.recovery": "恢复阶段",
    "demo.recoveryText": "错误率下降，吞吐与延迟逐步回到稳定区间。",
    "demo.done": "演示完成",
    "demo.running": "演示播放中",
    "anomaly.kicker": "异常明细",
    "anomaly.title": "最近错误与慢请求",
    "anomaly.note": "从当前导入日志中提取错误状态码和高延迟样本，便于从统计下钻到具体证据。",
    "anomaly.empty": "暂无异常样本。导入错误或慢请求日志后会显示在这里。",
    "anomaly.error": "错误",
    "anomaly.slow": "慢请求",
    "anomaly.status": "状态",
    "anomaly.latency": "延迟",
    "report.kicker": "分析报告",
    "report.title": "导出当前分析结果",
    "report.note": "生成 Markdown 或 JSON 报告，包含健康评分、关键指标、热门路径和异常样本。",
    "report.markdown": "导出 Markdown",
    "report.json": "导出 JSON",
    "report.ready": "报告已生成",
    "report.empty": "暂无可导出的指标。",
    "mode.presentation": "展示视图",
    "mode.ops": "运维视图",
    "mode.teaching": "教学视图",
    "screen.big": "大屏模式",
    "compare.kicker": "对比分析",
    "compare.title": "与基准样本对比",
    "compare.note": "保存一份当前分析作为基准，后续导入或演示结果会自动给出变化幅度。",
    "compare.save": "设为基准",
    "compare.clear": "清空对比",
    "compare.empty": "尚未保存基准样本。",
    "compare.errorRate": "错误率变化",
    "compare.latency": "P95 变化",
    "compare.errors": "错误数变化",
    "compare.total": "请求量变化",
    "history.kicker": "历史快照",
    "history.title": "最近分析记录",
    "history.note": "保存导入、样例和演示阶段的关键结果，便于答辩时快速回看。",
    "history.empty": "还没有分析记录。",
    "history.anomalies": "异常样本",
    "insight.kicker": "智能洞察",
    "insight.title": "当前风险与建议",
    "insight.note": "根据错误率、延迟分位数、异常样本和受影响服务自动生成展示结论。",
    "insight.low": "低风险",
    "insight.medium": "中风险",
    "insight.high": "高风险",
    "insight.empty": "等待导入或演示数据后生成洞察。",
    "insight.actionErrors": "优先检查 5xx 集中的支付与订单接口。",
    "insight.actionLatency": "优先关注高延迟路径及其下游依赖。",
    "insight.actionTraffic": "继续观察吞吐变化和恢复趋势。",
    "services.kicker": "服务热力榜",
    "services.title": "受影响服务与接口",
    "services.note": "按错误数、平均延迟和请求量聚合当前样本，便于定位最值得展示的服务。",
    "services.empty": "当前没有足够的服务维度样本。",
    "services.requests": "请求",
    "services.errors": "错误",
    "services.avgLatency": "平均延迟",
    "services.errorRate": "错误率",
    "replay.kicker": "事件回放",
    "replay.title": "最近关键事件",
    "replay.note": "从当前导入日志中抽取具有代表性的请求，按风险优先级滚动展示。",
    "replay.empty": "暂无可回放的关键事件。",
    "overview.kicker": "运行态势",
    "overview.title": "健康评分",
    "overview.validRatio": "有效占比",
    "overview.errorPressure": "错误压力",
    "trend.kicker": "输入趋势",
    "trend.title": "最近刷新吞吐",
    "status.kicker": "状态分布",
    "status.title": "HTTP 响应构成",
    "incident.healthy": "Healthy",
    "incident.warn": "Warning",
    "incident.critical": "Critical",
    "incident.healthyMessage": "当前日志流运行正常。",
    "incident.warnMessage": "错误压力升高，建议关注异常路径。",
    "incident.criticalMessage": "错误率处于高位，适合展示告警与故障分析。",
    "window.10s": "10 秒",
    "window.1m": "1 分钟",
    "window.5m": "5 分钟",
    "window.awaiting": "等待后端窗口",
    "window.rolling": "滚动窗口",
    "window.events": "事件数",
    "window.qps": "QPS",
    "window.errors": "错误数",
    "chart.status": "状态码统计",
    "chart.paths": "热门路径",
    "pipeline.kicker": "Pipeline 遥测",
    "pipeline.title": "队列与丢弃统计",
    "pipeline.note": "该面板会展示队列深度、容量、解析失败、丢弃行数和丢弃率等字段。",
    "pipeline.importKicker": "导入分析",
    "pipeline.importTitle": "导入分析摘要",
    "pipeline.importNote": "在线导入不会进入实时队列，这里展示当前样本的输入规模、解析质量和异常样本数。",
    "pipeline.queueCapacity": "队列容量",
    "pipeline.queueDepth": "队列深度",
    "pipeline.workers": "Worker 数",
    "pipeline.parseFailures": "解析失败",
    "pipeline.droppedLines": "丢弃行数",
    "pipeline.dropRate": "丢弃率",
    "pipeline.importMode": "分析模式",
    "pipeline.importModeValue": "在线导入",
    "pipeline.inputLines": "输入行数",
    "pipeline.parsedEvents": "解析成功",
    "pipeline.invalidLines": "解析失败",
    "pipeline.invalidRate": "失败率",
    "pipeline.anomalySamples": "异常样本",
    "alerts.kicker": "告警",
    "alerts.title": "活动告警",
    "alerts.note": "当后端返回告警负载时，这里会显示告警规则和当前事件详情。",
    "alerts.none": "暂无活动告警。该面板已接入",
    "alerts.alert": "告警",
    "alerts.active": "active",
    "alerts.current": "当前",
    "alerts.threshold": "阈值",
    "alerts.for": "持续",
    "empty.noData": "暂无数据",
    "empty.pipeline": "后端返回队列和丢弃字段后，pipeline 统计会显示在这里。",
    "common.na": "暂无",
    footer: "每 2 秒轮询 <code>/metrics</code>，展示全局、滚动窗口、pipeline 和告警视图。",
  },
  en: {
    "app.title": "logscope Dashboard",
    "hero.subtitle": "Real-time JSONL log analytics with rolling windows, percentile summaries, pipeline telemetry, and alerts-ready views.",
    "status.waiting": "Waiting for metrics...",
    "status.updated": "Updated",
    "status.refreshFailed": "Refresh failed",
    "metric.total": "Total Lines",
    "metric.valid": "Valid Events",
    "metric.invalid": "Invalid Lines",
    "metric.errors": "Errors (5xx)",
    "metric.errorRate": "Error Rate",
    "metric.avgLatency": "Average Latency",
    "metric.maxLatency": "Max Latency",
    "latency.kicker": "Latency distribution",
    "latency.title": "Percentiles and peak values",
    "latency.note": "The dashboard renders optional percentile fields when they are available and stays compatible with older metric schemas.",
    "latency.p50": "P50 Latency",
    "latency.p95": "P95 Latency",
    "latency.p99": "P99 Latency",
    "windows.kicker": "Rolling windows",
    "windows.title": "10s, 1m, and 5m views",
    "windows.note": "Each card is wired for the richer metrics schema and gracefully shows legacy recent_60s data if that is all the server returns.",
    "import.kicker": "Online import",
    "import.title": "Paste logs or choose a sample file",
    "import.note": "Imported results render temporarily in this dashboard without overwriting the live runtime metrics.",
    "import.format": "Log format",
    "import.file": "Sample file",
    "import.submit": "Analyze import",
    "import.live": "Resume live",
    "import.placeholder": "Paste JSON Lines or access log content",
    "import.idle": "Waiting for import...",
    "import.loadingFile": "Reading file...",
    "import.readyFile": "File loaded. Ready to analyze.",
    "import.empty": "Paste log content or choose a file first.",
    "import.analyzing": "Analyzing imported logs...",
    "import.done": "Import complete",
    "import.lines": "lines",
    "import.failed": "Import failed",
    "import.liveMode": "Live metrics resumed.",
    "sample.error": "Error spike sample",
    "sample.apache": "Apache sample",
    "sample.lambda": "Lambda sample",
    "demo.kicker": "Demo mode",
    "demo.title": "Play incident evolution",
    "demo.note": "Automatically plays healthy traffic, error spike, latency spike, and recovery stages for presentations.",
    "demo.play": "Start demo",
    "demo.stop": "Stop",
    "demo.idle": "Ready",
    "demo.normal": "Healthy traffic",
    "demo.normalText": "The system is healthy with low error rate and latency.",
    "demo.error": "Error spike",
    "demo.errorText": "Order payment callbacks return 5xx, lowering the health score and surfacing alerts.",
    "demo.latency": "Latency spike",
    "demo.latencyText": "Search and inventory paths slow down, raising P95/P99 latency.",
    "demo.recovery": "Recovery",
    "demo.recoveryText": "Errors decrease while throughput and latency return to stable levels.",
    "demo.done": "Demo complete",
    "demo.running": "Demo running",
    "anomaly.kicker": "Anomaly details",
    "anomaly.title": "Recent errors and slow requests",
    "anomaly.note": "Extracts error statuses and high-latency samples from the current import for evidence-level drilldown.",
    "anomaly.empty": "No anomaly samples yet. Import error or slow logs to populate this panel.",
    "anomaly.error": "Error",
    "anomaly.slow": "Slow",
    "anomaly.status": "Status",
    "anomaly.latency": "Latency",
    "report.kicker": "Analysis report",
    "report.title": "Export current analysis",
    "report.note": "Generate Markdown or JSON with health score, key metrics, top paths, and anomaly samples.",
    "report.markdown": "Export Markdown",
    "report.json": "Export JSON",
    "report.ready": "Report generated",
    "report.empty": "No metrics available to export yet.",
    "mode.presentation": "Presentation View",
    "mode.ops": "Ops View",
    "mode.teaching": "Teaching View",
    "screen.big": "Big Screen",
    "compare.kicker": "Compare",
    "compare.title": "Compare with baseline",
    "compare.note": "Save the current analysis as a baseline and automatically measure later imports or demo stages against it.",
    "compare.save": "Save Baseline",
    "compare.clear": "Clear Compare",
    "compare.empty": "No baseline saved yet.",
    "compare.errorRate": "Error Rate Delta",
    "compare.latency": "P95 Delta",
    "compare.errors": "Error Count Delta",
    "compare.total": "Request Delta",
    "history.kicker": "History",
    "history.title": "Recent analysis snapshots",
    "history.note": "Stores imports, samples, and demo stages for quick callback during a presentation.",
    "history.empty": "No analysis snapshots yet.",
    "history.anomalies": "Anomalies",
    "insight.kicker": "Smart insight",
    "insight.title": "Current risk and next steps",
    "insight.note": "Automatically summarizes the current state from error rate, latency percentiles, anomaly samples, and affected services.",
    "insight.low": "Low Risk",
    "insight.medium": "Medium Risk",
    "insight.high": "High Risk",
    "insight.empty": "Load import or demo data to generate insights.",
    "insight.actionErrors": "Inspect payment and order APIs with concentrated 5xx failures first.",
    "insight.actionLatency": "Prioritize slow paths and their downstream dependencies.",
    "insight.actionTraffic": "Keep watching throughput changes and recovery trend.",
    "services.kicker": "Service heatmap",
    "services.title": "Affected services and APIs",
    "services.note": "Aggregates the current sample by errors, average latency, and request volume to spotlight the best demo targets.",
    "services.empty": "Not enough service-level samples yet.",
    "services.requests": "Requests",
    "services.errors": "Errors",
    "services.avgLatency": "Avg Latency",
    "services.errorRate": "Error Rate",
    "replay.kicker": "Event replay",
    "replay.title": "Recent key events",
    "replay.note": "Pulls representative requests from the current import and displays them in risk order.",
    "replay.empty": "No key events available yet.",
    "overview.kicker": "Runtime signal",
    "overview.title": "Health score",
    "overview.validRatio": "Valid ratio",
    "overview.errorPressure": "Error pressure",
    "trend.kicker": "Input trend",
    "trend.title": "Recent refresh throughput",
    "status.kicker": "Status mix",
    "status.title": "HTTP response makeup",
    "incident.healthy": "Healthy",
    "incident.warn": "Warning",
    "incident.critical": "Critical",
    "incident.healthyMessage": "The current log stream looks healthy.",
    "incident.warnMessage": "Error pressure is elevated. Watch the anomalous paths.",
    "incident.criticalMessage": "Error rate is high, which is useful for alert and incident demos.",
    "window.10s": "10 Seconds",
    "window.1m": "1 Minute",
    "window.5m": "5 Minutes",
    "window.awaiting": "Awaiting backend window",
    "window.rolling": "Rolling window",
    "window.events": "Events",
    "window.qps": "QPS",
    "window.errors": "Errors",
    "chart.status": "Status Counts",
    "chart.paths": "Top Paths",
    "pipeline.kicker": "Pipeline telemetry",
    "pipeline.title": "Queue and drop stats",
    "pipeline.note": "This panel shows queue depth, capacity, parse failures, dropped lines, and drop rate fields.",
    "pipeline.importKicker": "Import analysis",
    "pipeline.importTitle": "Import summary",
    "pipeline.importNote": "Online imports bypass the live queue, so this view summarizes input scale, parse quality, and anomaly samples.",
    "pipeline.queueCapacity": "Queue Capacity",
    "pipeline.queueDepth": "Queue Depth",
    "pipeline.workers": "Workers",
    "pipeline.parseFailures": "Parse Failures",
    "pipeline.droppedLines": "Dropped Lines",
    "pipeline.dropRate": "Drop Rate",
    "pipeline.importMode": "Analysis Mode",
    "pipeline.importModeValue": "Online Import",
    "pipeline.inputLines": "Input Lines",
    "pipeline.parsedEvents": "Parsed Events",
    "pipeline.invalidLines": "Parse Failures",
    "pipeline.invalidRate": "Failure Rate",
    "pipeline.anomalySamples": "Anomaly Samples",
    "alerts.kicker": "Alerts",
    "alerts.title": "Active alerts",
    "alerts.note": "This panel shows alert rules and current incident details when the backend exposes alert payloads.",
    "alerts.none": "No active alerts yet. This panel is ready for",
    "alerts.alert": "Alert",
    "alerts.active": "active",
    "alerts.current": "current",
    "alerts.threshold": "threshold",
    "alerts.for": "for",
    "empty.noData": "No data yet",
    "empty.pipeline": "Pipeline stats will appear here once the backend exposes queue and drop fields.",
    "common.na": "n/a",
    footer: "Polling <code>/metrics</code> every 2 seconds with all-time, rolling-window, pipeline, and alert-aware views.",
  },
};

const storedLanguage = localStorage.getItem("logscope-language");
let currentLanguage = storedLanguage === "en" ? "en" : "zh";
let latestMetrics = null;
let importPreview = false;
let metricHistory = [];
let pendingRenderFrame = 0;
let pendingRenderResolve = null;
const renderCache = new Map();
const demoSampleCache = new Map();
let currentAnomalies = [];
let currentAnalysisSource = "";
let demoTimer = null;
let demoSleepResolve = null;
let demoRunning = false;
let demoStageIndex = -1;
let currentParsedEvents = [];
let currentViewMode = "presentation";
let baselineMetrics = null;
let analysisHistory = [];

const DEMO_SAMPLE_CONFIG = {
  error: {
    format: "auto",
    build: () => buildJsonSample("error", 420),
  },
  apache: {
    format: "auto",
    build: () => buildApacheSample(260),
  },
  lambda: {
    format: "auto",
    build: () => buildLambdaSample(220),
  },
};

const DEMO_STAGES = [
  {
    key: "normal",
    sample: () => buildJsonSample("normal", 180),
    duration: 1600,
  },
  {
    key: "error",
    sample: () => buildJsonSample("error", 420),
    duration: 1900,
  },
  {
    key: "latency",
    sample: () => buildJsonSample("latency", 360),
    duration: 1900,
  },
  {
    key: "recovery",
    sample: () => buildJsonSample("recovery", 240),
    duration: 1600,
  },
];

function buildJsonSample(mode, count) {
  const paths = ["/api/orders", "/api/users", "/api/search", "/api/payments/refund", "/api/inventory/reconcile"];
  const services = ["gateway", "auth", "search", "payment", "inventory"];
  const lines = [];

  for (let index = 0; index < count; index += 1) {
    const burst = mode === "error" && index > count * 0.36 && index < count * 0.78;
    const latencySpike = mode === "latency" && index > count * 0.26 && index < count * 0.84;
    const recoveryTail = mode === "recovery" && index < count * 0.18;
    const status = burst && index % 3 !== 0
      ? [500, 502, 503, 504][index % 4]
      : recoveryTail && index % 9 === 0
        ? 502
        : [200, 200, 200, 201, 204][index % 5];
    const latency = latencySpike
      ? 240 + (index % 11) * 52
      : burst
        ? 120 + (index % 9) * 38
        : recoveryTail
          ? 130 + (index % 6) * 22
          : 22 + (index % 12) * 7;
    const path = burst && index % 2 === 0
      ? "/api/orders/checkout/payment/callback"
      : latencySpike && index % 2 === 0
        ? "/api/search/catalog/recommendation/rank"
        : paths[index % paths.length];
    lines.push(
      JSON.stringify({
        timestamp: `2026-04-20T12:${String(Math.floor(index / 60)).padStart(2, "0")}:${String(index % 60).padStart(2, "0")}Z`,
        path,
        status,
        latency_ms: latency,
        method: index % 4 === 0 ? "POST" : "GET",
        service: services[index % services.length],
      }),
    );
  }

  return lines.join("\n");
}

function buildApacheSample(count) {
  const paths = [
    "/MyApp/js/jquery-ui-1.8.16.custom.min.js;jsessionid=LFNznJS9bthi5s069LQILA__.ome-as5--myapp",
    "/MyApp/",
    "/MyApp/api/v1/orders/export/report.csv",
    "/MyApp/static/assets/dashboard/chunk-vendors.js",
    "/MyApp/login",
  ];
  const lines = [];

  for (let index = 0; index < count; index += 1) {
    const status = index % 19 === 0 ? 408 : index % 13 === 0 ? 500 : 200;
    const size = 900 + (index % 15) * 317;
    lines.push(
      `10.130.77.${index % 255} - - [12/Mar/2012:22:${String(index % 60).padStart(2, "0")}:03 -0500] "GET ${paths[index % paths.length]} HTTP/1.1" ${status} ${size} "-" "Mozilla/5.0"`,
    );
  }

  return lines.join("\n");
}

function buildLambdaSample(count) {
  const lines = [];

  for (let index = 0; index < count; index += 1) {
    const path = index % 3 === 0 ? "/helloworld" : index % 3 === 1 ? "/checkout/payment/confirm" : "/profile/settings/security";
    lines.push(
      JSON.stringify({
        functionName: index % 2 === 0 ? "HelloWorldApi-prod" : "CheckoutApi-prod",
        apiContext: {
          routeKey: `${index % 4 === 0 ? "POST" : "GET"} ${path}`,
          rawPath: path,
          requestContext: {
            http: {
              method: index % 4 === 0 ? "POST" : "GET",
              path,
            },
          },
          headers: {
            "content-length": String(60 + (index % 20) * 21),
          },
        },
        statusCode: index % 17 === 0 ? 502 : 200,
        duration_ms: index % 17 === 0 ? 260 + index : 35 + (index % 9) * 8,
        timestamp: `2020-06-21T14:${String(Math.floor(index / 60)).padStart(2, "0")}:${String(index % 60).padStart(2, "0")}.264Z`,
      }),
    );
  }

  return lines.join("\n");
}

function t(key) {
  return I18N[currentLanguage][key] || I18N.en[key] || key;
}

const WINDOW_CONFIG = [
  {
    key: "10s",
    labelKey: "window.10s",
    aliases: ["window_10s", "recent_10s"],
  },
  {
    key: "1m",
    labelKey: "window.1m",
    aliases: ["window_1m", "recent_60s"],
  },
  {
    key: "5m",
    labelKey: "window.5m",
    aliases: ["window_5m", "recent_300s"],
  },
];

const PIPELINE_FIELDS = [
  ["queue_capacity", "pipeline.queueCapacity"],
  ["queue_len", "pipeline.queueDepth"],
  ["queue_depth", "pipeline.queueDepth"],
  ["workers", "pipeline.workers"],
  ["parse_failures", "pipeline.parseFailures"],
  ["dropped_lines", "pipeline.droppedLines"],
  ["drop_rate", "pipeline.dropRate"],
];

function formatNumber(value) {
  return new Intl.NumberFormat(currentLanguage === "zh" ? "zh-CN" : "en-US").format(value);
}

function formatInt(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return t("common.na");
  }

  return formatNumber(Number(value));
}

function formatFloat(value, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return t("common.na");
  }

  return Number(value).toFixed(digits);
}

function formatPercent(value, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return t("common.na");
  }

  const numeric = Number(value);
  const percent = Math.abs(numeric) <= 1 ? numeric * 100 : numeric;
  return `${percent.toFixed(digits)}%`;
}

function metricText(value, formatter, suffix = "") {
  const formatted = formatter(value);
  return formatted === t("common.na") ? formatted : `${formatted}${suffix}`;
}

function firstDefined(...values) {
  return values.find((value) => value !== undefined && value !== null);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

function runWhenIdle(callback) {
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(callback, { timeout: 900 });
    return;
  }

  window.setTimeout(callback, 0);
}

function setText(node, value) {
  if (node.textContent !== value) {
    node.textContent = value;
  }
}

function setSignature(key, signature) {
  if (renderCache.get(key) === signature) {
    return false;
  }

  renderCache.set(key, signature);
  return true;
}

function clearRenderCache() {
  renderCache.clear();
}

function getDemoSample(key) {
  if (demoSampleCache.has(key)) {
    return demoSampleCache.get(key);
  }

  const config = DEMO_SAMPLE_CONFIG[key];
  if (!config) {
    return null;
  }

  const sample = {
    format: config.format,
    content: config.build(),
  };
  demoSampleCache.set(key, sample);
  return sample;
}

function sleep(ms) {
  return new Promise((resolve) => {
    demoSleepResolve = resolve;
    demoTimer = window.setTimeout(() => {
      demoTimer = null;
      demoSleepResolve = null;
      resolve();
    }, ms);
  });
}

function parseEventFromJson(line) {
  try {
    const event = JSON.parse(line);
    const status = firstDefined(event.status, event.status_code, event.statusCode, event.http?.status_code);
    const latency = firstDefined(event.latency_ms, event.duration_ms, event.elapsed_ms, event.duration);
    const path = firstDefined(
      event.path,
      event.url,
      event.uri,
      event.rawPath,
      event.apiContext?.rawPath,
      event.apiContext?.requestContext?.http?.path,
    );
    return {
      timestamp: event.timestamp || event.time || event["@timestamp"] || "",
      method: event.method || event.http?.method || event.apiContext?.requestContext?.http?.method || "",
      path: path || "/",
      status: toNumber(status, 0),
      latency_ms: toNumber(latency, 0),
      service: event.service || event.functionName || event.component || "",
      raw: line,
    };
  } catch {
    return null;
  }
}

function parseEventFromAccess(line) {
  const combined = line.match(/^\S+\s+\S+\s+\S+\s+\[[^\]]+\]\s+"([A-Z]+)\s+([^"\s]+)\s+[^"]+"\s+(\d{3})\s+(\d+|-)/);
  if (combined) {
    const size = combined[4] === "-" ? 0 : toNumber(combined[4]);
    return {
      timestamp: "",
      method: combined[1],
      path: combined[2],
      status: toNumber(combined[3]),
      latency_ms: Math.max(12, Math.round(size / 42)),
      service: "access",
      raw: line,
    };
  }

  const simple = line.trim().split(/\s+/);
  if (simple.length >= 4) {
    return {
      timestamp: simple[0],
      method: simple[1],
      path: simple[2],
      status: toNumber(simple[3]),
      latency_ms: toNumber(simple[4], 0),
      service: "access",
      raw: line,
    };
  }

  return null;
}

function parseImportedEvents(content, format) {
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      if (format === "access") {
        return parseEventFromAccess(line);
      }
      return parseEventFromJson(line) || parseEventFromAccess(line);
    })
    .filter(Boolean);
}

function extractAnomalies(content, format) {
  const events = parseImportedEvents(content, format);
  return events
    .filter((event) => event.status >= 500 || event.latency_ms >= 180)
    .sort((a, b) => {
      const severityA = (a.status >= 500 ? 1000 : 0) + a.latency_ms;
      const severityB = (b.status >= 500 ? 1000 : 0) + b.latency_ms;
      return severityB - severityA;
    })
    .slice(0, 8);
}

function renderAnomalies(anomalies) {
  const signature = JSON.stringify({ language: currentLanguage, anomalies });
  if (!setSignature("anomalies", signature)) {
    return;
  }

  if (!anomalies.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = t("anomaly.empty");
    ids.anomaliesPanel.replaceChildren(empty);
    return;
  }

  const fragment = document.createDocumentFragment();
  anomalies.forEach((event) => {
    const item = document.createElement("div");
    item.className = "anomaly-item";

    const head = document.createElement("div");
    head.className = "anomaly-head";

    const title = document.createElement("div");
    title.className = "anomaly-path";
    title.textContent = compactPath(event.path);
    title.title = event.path;
    title.dataset.fullPath = event.path;

    const badge = document.createElement("span");
    badge.className = `anomaly-badge ${event.status >= 500 ? "danger-badge" : ""}`;
    badge.textContent = event.status >= 500 ? t("anomaly.error") : t("anomaly.slow");

    head.append(title, badge);

    const meta = document.createElement("div");
    meta.className = "anomaly-meta";
    meta.textContent = [
      event.method || null,
      event.service || null,
      `${t("anomaly.status")} ${event.status || t("common.na")}`,
      `${t("anomaly.latency")} ${formatInt(event.latency_ms)} ms`,
    ]
      .filter(Boolean)
      .join(" | ");

    item.append(head, meta);
    fragment.appendChild(item);
  });

  ids.anomaliesPanel.replaceChildren(fragment);
}

function computeInsightModel() {
  if (!latestMetrics) {
    return null;
  }

  const errorRate = toNumber(latestMetrics.error_rate);
  const p95 = toNumber(latestMetrics.latency_p95_ms);
  const anomalyWeight = Math.min(currentAnomalies.length * 6, 28);
  const errorWeight = Math.min(errorRate * 100, 45);
  const latencyWeight = p95 >= 320 ? 32 : p95 >= 180 ? 18 : 8;
  const score = Math.round(clamp(errorWeight + latencyWeight + anomalyWeight, 8, 100));

  let level = "low";
  if (score >= 70) {
    level = "high";
  } else if (score >= 40) {
    level = "medium";
  }

  const errorDominant = errorRate >= 0.18;
  const latencyDominant = p95 >= 220;
  const headline = errorDominant
    ? `${t("insight.high")} · ${formatPercent(errorRate)} ${t("metric.errorRate")}`
    : latencyDominant
      ? `${t("insight.medium")} · P95 ${formatInt(p95)} ms`
      : `${t(`insight.${level}`)} · ${formatInt(currentParsedEvents.length)} ${t("services.requests")}`;

  const affectedServices = computeServiceRows().slice(0, 2).map((row) => row.name).join(" / ");
  const summary = errorDominant
    ? `5xx ${t("metric.errors")} ${formatInt(latestMetrics.errors)}，重点受影响服务：${affectedServices || t("common.na")}`
    : latencyDominant
      ? `${t("latency.p95")} 达到 ${formatInt(p95)} ms，慢请求主要集中在 ${affectedServices || t("common.na")}`
      : `${t("trend.title")} 保持平稳，可继续观察 ${t("window.1m")} 与 ${t("window.5m")} 的恢复趋势。`;

  const actions = [];
  if (errorDominant) {
    actions.push(t("insight.actionErrors"));
  }
  if (latencyDominant) {
    actions.push(t("insight.actionLatency"));
  }
  actions.push(t("insight.actionTraffic"));

  return { score, level, headline, summary, actions };
}

function renderInsights() {
  const insight = computeInsightModel();
  if (!insight) {
    setText(ids.insightScore, "--");
    setText(ids.insightHeadline, t("insight.empty"));
    setText(ids.insightSummary, t("insight.empty"));
    ids.insightActions.replaceChildren();
    return;
  }

  setText(ids.insightScore, `${insight.score}`);
  setText(ids.insightHeadline, insight.headline);
  setText(ids.insightSummary, insight.summary);
  ids.insightScore.dataset.level = insight.level;

  const signature = JSON.stringify({ language: currentLanguage, actions: insight.actions });
  if (!setSignature("insight-actions", signature)) {
    return;
  }

  const fragment = document.createDocumentFragment();
  insight.actions.forEach((text) => {
    const item = document.createElement("div");
    item.className = "insight-action";
    item.textContent = text;
    fragment.appendChild(item);
  });
  ids.insightActions.replaceChildren(fragment);
}

function computeServiceRows() {
  const buckets = new Map();
  currentParsedEvents.forEach((event) => {
    const key = event.service || event.path.split("/").filter(Boolean)[0] || "unknown";
    const bucket = buckets.get(key) || { name: key, requests: 0, errors: 0, latencySum: 0 };
    bucket.requests += 1;
    bucket.errors += event.status >= 500 ? 1 : 0;
    bucket.latencySum += event.latency_ms;
    buckets.set(key, bucket);
  });

  return Array.from(buckets.values())
    .map((bucket) => ({
      ...bucket,
      avgLatency: bucket.requests ? bucket.latencySum / bucket.requests : 0,
      errorRate: bucket.requests ? bucket.errors / bucket.requests : 0,
    }))
    .sort((a, b) => {
      const scoreA = a.errors * 10 + a.avgLatency * 0.03 + a.requests * 0.1;
      const scoreB = b.errors * 10 + b.avgLatency * 0.03 + b.requests * 0.1;
      return scoreB - scoreA;
    })
    .slice(0, 5);
}

function renderServices() {
  const rows = computeServiceRows();
  const signature = JSON.stringify({ language: currentLanguage, rows });
  if (!setSignature("services-panel", signature)) {
    return;
  }

  if (!rows.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = t("services.empty");
    ids.servicesPanel.replaceChildren(empty);
    return;
  }

  const fragment = document.createDocumentFragment();
  rows.forEach((row) => {
    const item = document.createElement("div");
    item.className = "service-item";

    const head = document.createElement("div");
    head.className = "service-head";

    const name = document.createElement("div");
    name.className = "service-name";
    name.textContent = row.name;

    const score = document.createElement("div");
    score.className = "service-score";
    score.textContent = `${formatPercent(row.errorRate, 1)} / ${formatInt(Math.round(row.avgLatency))} ms`;

    head.append(name, score);

    const meta = document.createElement("div");
    meta.className = "service-meta";
    meta.textContent = [
      `${t("services.requests")} ${formatInt(row.requests)}`,
      `${t("services.errors")} ${formatInt(row.errors)}`,
      `${t("services.avgLatency")} ${formatInt(Math.round(row.avgLatency))} ms`,
    ].join(" | ");

    const track = document.createElement("div");
    track.className = "service-track";

    const fill = document.createElement("div");
    fill.className = "service-fill";
    fill.style.width = `${clamp(row.errorRate * 100 + row.avgLatency / 8, 16, 100)}%`;

    track.appendChild(fill);
    item.append(head, meta, track);
    fragment.appendChild(item);
  });
  ids.servicesPanel.replaceChildren(fragment);
}

function renderReplay() {
  const events = [...currentParsedEvents]
    .sort((a, b) => ((b.status >= 500 ? 1000 : 0) + b.latency_ms) - ((a.status >= 500 ? 1000 : 0) + a.latency_ms))
    .slice(0, 6);
  const signature = JSON.stringify({ language: currentLanguage, events });
  if (!setSignature("replay-stream", signature)) {
    return;
  }

  if (!events.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = t("replay.empty");
    ids.replayStream.replaceChildren(empty);
    return;
  }

  const fragment = document.createDocumentFragment();
  events.forEach((event, index) => {
    const item = document.createElement("div");
    item.className = "replay-item";
    item.style.animationDelay = `${index * 90}ms`;

    const tag = document.createElement("span");
    tag.className = `replay-tag ${event.status >= 500 ? "danger-badge" : ""}`;
    tag.textContent = event.status >= 500 ? t("anomaly.error") : t("anomaly.slow");

    const text = document.createElement("div");
    text.className = "replay-text";
    text.textContent = `${event.method || "GET"} ${compactPath(event.path)} · ${t("anomaly.status")} ${event.status} · ${t("anomaly.latency")} ${formatInt(event.latency_ms)} ms`;
    text.title = `${event.method || "GET"} ${event.path}`;

    item.append(tag, text);
    fragment.appendChild(item);
  });
  ids.replayStream.replaceChildren(fragment);
}

function renderCompare() {
  const signature = JSON.stringify({
    language: currentLanguage,
    baseline: baselineMetrics,
    current: latestMetrics && {
      total: toNumber(latestMetrics.total),
      errors: toNumber(latestMetrics.errors),
      error_rate: toNumber(latestMetrics.error_rate),
      p95: toNumber(latestMetrics.latency_p95_ms),
    },
  });
  if (!setSignature("compare-panel", signature)) {
    return;
  }

  if (!baselineMetrics || !latestMetrics) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = t("compare.empty");
    ids.comparePanel.replaceChildren(empty);
    return;
  }

  const rows = [
    [t("compare.errorRate"), toNumber(latestMetrics.error_rate) - baselineMetrics.errorRate, "%"],
    [t("compare.latency"), toNumber(latestMetrics.latency_p95_ms) - baselineMetrics.p95, " ms"],
    [t("compare.errors"), toNumber(latestMetrics.errors) - baselineMetrics.errors, ""],
    [t("compare.total"), toNumber(latestMetrics.total) - baselineMetrics.total, ""],
  ];

  const fragment = document.createDocumentFragment();
  rows.forEach(([label, delta, suffix]) => {
    const row = document.createElement("div");
    row.className = "compare-row";

    const name = document.createElement("div");
    name.className = "compare-name";
    name.textContent = label;

    const value = document.createElement("div");
    value.className = `compare-value ${delta > 0 ? "compare-up" : delta < 0 ? "compare-down" : ""}`;
    const rendered = suffix === "%"
      ? `${delta >= 0 ? "+" : ""}${(delta * 100).toFixed(2)}%`
      : `${delta >= 0 ? "+" : ""}${formatInt(Math.round(delta))}${suffix}`;
    value.textContent = rendered;

    row.append(name, value);
    fragment.appendChild(row);
  });
  ids.comparePanel.replaceChildren(fragment);
}

function renderHistory() {
  const signature = JSON.stringify({ language: currentLanguage, history: analysisHistory });
  if (!setSignature("history-panel", signature)) {
    return;
  }

  if (!analysisHistory.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = t("history.empty");
    ids.historyPanel.replaceChildren(empty);
    return;
  }

  const fragment = document.createDocumentFragment();
  analysisHistory.forEach((item) => {
    const row = document.createElement("div");
    row.className = "history-item";

    const head = document.createElement("div");
    head.className = "history-head";

    const label = document.createElement("div");
    label.className = "history-label";
    label.textContent = item.label;

    const time = document.createElement("div");
    time.className = "history-time";
    time.textContent = new Date(item.timestamp).toLocaleTimeString(currentLanguage === "zh" ? "zh-CN" : "en-US");

    head.append(label, time);

    const meta = document.createElement("div");
    meta.className = "history-meta";
    meta.textContent = [
      `${t("metric.total")} ${formatInt(item.total)}`,
      `${t("metric.errors")} ${formatInt(item.errors)}`,
      `${t("history.anomalies")} ${formatInt(item.anomalies)}`,
      `P95 ${formatInt(item.p95)} ms`,
    ].join(" | ");

    row.append(head, meta);
    fragment.appendChild(row);
  });
  ids.historyPanel.replaceChildren(fragment);
}

function setViewMode(mode) {
  currentViewMode = mode;
  document.body.dataset.viewMode = mode;
  ids.viewModeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.viewMode === mode);
  });
}

function toggleBigScreen() {
  document.body.classList.toggle("stage-mode");
}

function focusDemoArea(stageKey) {
  if (currentViewMode !== "presentation") {
    return;
  }

  const target =
    stageKey === "error"
      ? ids.anomaliesPanel.closest(".card")
      : stageKey === "latency"
        ? ids.replayStream.closest(".card")
        : stageKey === "recovery"
          ? ids.comparePanel.closest(".card")
          : ids.healthRing.closest(".card");

  if (!target) {
    return;
  }

  target.classList.remove("flash");
  void target.offsetWidth;
  target.classList.add("flash");
  target.scrollIntoView({ behavior: "smooth", block: "center" });
}

function updateAnalysisSource(content, format) {
  currentAnalysisSource = content;
  currentParsedEvents = parseImportedEvents(content, format);
  currentAnomalies = extractAnomalies(content, format);
  renderAnomalies(currentAnomalies);
  renderInsights();
  renderServices();
  renderReplay();
}

function clearAnalysisSource() {
  currentAnalysisSource = "";
  currentParsedEvents = [];
  currentAnomalies = [];
  renderAnomalies(currentAnomalies);
  renderInsights();
  renderServices();
  renderReplay();
}

function pushAnalysisSnapshot(label) {
  if (!latestMetrics) {
    return;
  }

  analysisHistory.unshift({
    label,
    timestamp: new Date().toISOString(),
    total: toNumber(latestMetrics.total),
    errors: toNumber(latestMetrics.errors),
    errorRate: toNumber(latestMetrics.error_rate),
    p95: toNumber(latestMetrics.latency_p95_ms),
    anomalies: currentAnomalies.length,
  });
  analysisHistory = analysisHistory.slice(0, 8);
  renderHistory();
}

function compactPath(path) {
  if (!path || path === "/") {
    return path || "/";
  }

  const [cleanPath] = String(path).split("?");
  const parts = cleanPath.split("/").filter(Boolean);
  if (parts.length <= 2) {
    return cleanPath;
  }

  return `.../${parts.slice(-2).join("/")}`;
}

function bestQps(metrics) {
  const candidates = [metrics.windows?.["10s"]?.qps, metrics.windows?.["1m"]?.qps, metrics.windows?.["5m"]?.qps]
    .map((value) => toNumber(value))
    .filter((value) => value > 0);
  if (candidates.length) {
    return candidates[0];
  }

  const total = toNumber(metrics.total);
  const uptime = toNumber(metrics.uptime_secs);
  if (total > 0) {
    return total / clamp(uptime || 60, 10, 300);
  }

  return 0;
}

function getWindowMetrics(metrics, key, aliases = []) {
  const windowMetrics = metrics.windows?.[key];
  if (windowMetrics) {
    return windowMetrics;
  }

  for (const alias of aliases) {
    if (metrics.windows?.[alias]) {
      return metrics.windows[alias];
    }
    if (metrics[alias]) {
      return metrics[alias];
    }
  }

  if (key === "1m" && metrics.recent_60s) {
    return metrics.recent_60s;
  }

  return null;
}

function renderBars(target, items, dangerCutoff = false, options = {}) {
  const visibleItems = items.slice(0, options.limit || 8);
  const signature = JSON.stringify({
    language: currentLanguage,
    dangerCutoff,
    compactLabels: Boolean(options.compactLabels),
    items: visibleItems,
  });
  if (!setSignature(options.cacheKey || target.id || "bars", signature)) {
    return;
  }

  if (!visibleItems.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = t("empty.noData");
    target.replaceChildren(empty);
    return;
  }

  const maxValue = Math.max(...visibleItems.map((item) => item.value), 1);
  const fragment = document.createDocumentFragment();

  visibleItems.forEach((item) => {
    const row = document.createElement("div");
    row.className = "bar-row";

    const label = document.createElement("div");
    label.className = "bar-label";
    label.textContent = options.compactLabels ? compactPath(item.label) : item.label;
    label.title = item.label;
    if (options.compactLabels) {
      label.dataset.fullPath = item.label;
    }

    const track = document.createElement("div");
    track.className = "bar-track";

    const fill = document.createElement("div");
    fill.className = "bar-fill";
    if (dangerCutoff && Number(item.label) >= 500) {
      fill.classList.add("danger-fill");
    }
    fill.style.width = `${(item.value / maxValue) * 100}%`;
    track.appendChild(fill);

    const value = document.createElement("div");
    value.className = "bar-value";
    value.textContent = formatNumber(item.value);

    row.append(label, track, value);
    fragment.appendChild(row);
  });

  target.replaceChildren(fragment);
}

function renderKeyValueList(target, entries, emptyMessage) {
  const signature = JSON.stringify({ language: currentLanguage, entries, emptyMessage });
  if (!setSignature(target.id || "key-values", signature)) {
    return;
  }

  if (!entries.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = emptyMessage;
    target.replaceChildren(empty);
    return;
  }

  const fragment = document.createDocumentFragment();
  entries.forEach(([label, value]) => {
    const row = document.createElement("div");
    row.className = "stat-row";

    const name = document.createElement("div");
    name.className = "stat-name";
    name.textContent = label;

    const text = document.createElement("div");
    text.className = "stat-value";
    text.textContent = value;

    row.append(name, text);
    fragment.appendChild(row);
  });
  target.replaceChildren(fragment);
}

function renderOverview(metrics) {
  const total = toNumber(metrics.total);
  const valid = toNumber(metrics.valid);
  const invalid = toNumber(metrics.invalid);
  const errorRate = toNumber(metrics.error_rate);
  const validRatio = total > 0 ? valid / total : 1;
  const invalidPenalty = total > 0 ? invalid / total : 0;
  const health = Math.round(clamp(100 - errorRate * 100 - invalidPenalty * 45, 0, 100));
  const angle = clamp(health, 0, 100) * 3.6;
  const healthColor = health >= 85 ? "#0f766e" : health >= 65 ? "#d97706" : "#dc2626";

  const ringBackground = `conic-gradient(${healthColor} 0deg ${angle}deg, rgba(100, 116, 139, 0.16) ${angle}deg 360deg)`;
  if (ids.healthRing.style.background !== ringBackground) {
    ids.healthRing.style.background = ringBackground;
  }
  setText(ids.healthScore, `${formatInt(health)}%`);
  setText(ids.validRatio, formatPercent(validRatio));
  setText(ids.errorPressure, formatPercent(errorRate));

  const qps = bestQps(metrics);
  setText(ids.trendQps, metricText(qps, (value) => formatFloat(value, 2), " qps"));
  renderIncidentBanner(metrics, health);
}

function renderIncidentBanner(metrics, health) {
  const errors = toNumber(metrics.errors);
  const total = toNumber(metrics.total);
  const errorRate = toNumber(metrics.error_rate);
  let state = "healthy";

  if (errorRate >= 0.3 || health < 65) {
    state = "critical";
  } else if (errorRate >= 0.08 || health < 85) {
    state = "warn";
  }

  ids.incidentBanner.classList.toggle("warn", state === "warn");
  ids.incidentBanner.classList.toggle("critical", state === "critical");
  setText(ids.incidentTitle, t(`incident.${state}`));
  setText(ids.incidentMessage, t(`incident.${state}Message`));
  setText(ids.incidentMeta, `${formatInt(errors)} / ${formatInt(total)} · ${formatPercent(errorRate)}`);
}

function renderStatusDonut(statusCounts) {
  const entries = Object.entries(statusCounts || {})
    .map(([status, count]) => [status, toNumber(count)])
    .filter(([, count]) => count > 0);
  const total = entries.reduce((sum, [, count]) => sum + count, 0);
  const colors = ["#0f766e", "#2563eb", "#d97706", "#dc2626", "#7c3aed", "#0891b2"];
  const signature = JSON.stringify({ language: currentLanguage, entries });
  if (!setSignature("status-donut", signature)) {
    return;
  }

  if (!entries.length || total === 0) {
    ids.statusDonut.style.background = "conic-gradient(rgba(100, 116, 139, 0.18) 0deg 360deg)";
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = t("empty.noData");
    ids.statusLegend.replaceChildren(empty);
    return;
  }

  let start = 0;
  const segments = entries.map(([status, count], index) => {
    const degrees = (count / total) * 360;
    const end = start + degrees;
    const color = colors[index % colors.length];
    const segment = `${color} ${start.toFixed(2)}deg ${end.toFixed(2)}deg`;
    start = end;
    return segment;
  });
  ids.statusDonut.style.background = `conic-gradient(${segments.join(", ")})`;

  const fragment = document.createDocumentFragment();
  entries.slice(0, 5).forEach(([status, count], index) => {
    const row = document.createElement("div");
    row.className = "legend-item";

    const name = document.createElement("div");
    name.className = "legend-name";

    const dot = document.createElement("span");
    dot.className = "legend-dot";
    dot.style.background = colors[index % colors.length];

    const label = document.createElement("span");
    label.textContent = status;

    const value = document.createElement("strong");
    value.textContent = `${formatNumber(count)} · ${formatPercent(count / total, 1)}`;

    name.append(dot, label);
    row.append(name, value);
    fragment.appendChild(row);
  });
  ids.statusLegend.replaceChildren(fragment);
}

function pushMetricHistory(metrics) {
  const qps = toNumber(bestQps(metrics));
  if (!metricHistory.length && qps > 0) {
    const seeds = [0.62, 0.76, 0.7, 0.88, 0.82, 1.04, 0.96, 1.08, 1.0, 1.12];
    metricHistory = seeds.map((factor) => ({
      qps: qps * factor,
      total: toNumber(metrics.total),
      errors: toNumber(metrics.errors),
    }));
  }
  metricHistory.push({
    qps,
    total: toNumber(metrics.total),
    errors: toNumber(metrics.errors),
  });
  metricHistory = metricHistory.slice(-36);
}

function renderSparkline() {
  const canvas = ids.trafficSparkline;
  const context = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const padding = 18;
  const values = metricHistory.map((item) => item.qps);
  const maxValue = Math.max(...values, 1);

  context.clearRect(0, 0, width, height);
  context.fillStyle = "rgba(255, 255, 255, 0.55)";
  context.fillRect(0, 0, width, height);

  context.strokeStyle = "rgba(100, 116, 139, 0.18)";
  context.lineWidth = 1;
  for (let index = 1; index <= 3; index += 1) {
    const y = padding + ((height - padding * 2) / 4) * index;
    context.beginPath();
    context.moveTo(padding, y);
    context.lineTo(width - padding, y);
    context.stroke();
  }

  if (values.length < 2) {
    context.fillStyle = "#64748b";
    context.font = "16px Avenir Next, Segoe UI, sans-serif";
    context.fillText(t("empty.noData"), padding, height / 2);
    return;
  }

  const points = values.map((value, index) => {
    const x = padding + (index / (values.length - 1)) * (width - padding * 2);
    const y = height - padding - (value / maxValue) * (height - padding * 2);
    return [x, y];
  });

  const gradient = context.createLinearGradient(0, padding, 0, height - padding);
  gradient.addColorStop(0, "rgba(37, 99, 235, 0.26)");
  gradient.addColorStop(1, "rgba(15, 118, 110, 0.02)");

  context.beginPath();
  points.forEach(([x, y], index) => {
    if (index === 0) {
      context.moveTo(x, y);
      return;
    }
    context.lineTo(x, y);
  });
  context.lineTo(points[points.length - 1][0], height - padding);
  context.lineTo(points[0][0], height - padding);
  context.closePath();
  context.fillStyle = gradient;
  context.fill();

  context.beginPath();
  points.forEach(([x, y], index) => {
    if (index === 0) {
      context.moveTo(x, y);
      return;
    }
    context.lineTo(x, y);
  });
  context.strokeStyle = "#2563eb";
  context.lineWidth = 4;
  context.lineJoin = "round";
  context.lineCap = "round";
  context.stroke();
}

function renderAlerts(target, alerts) {
  const normalizedAlerts = alerts.slice(0, 6);
  const signature = JSON.stringify({ language: currentLanguage, alerts: normalizedAlerts });
  if (!setSignature(target.id || "alerts", signature)) {
    return;
  }

  if (!normalizedAlerts.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.innerHTML = `${t("alerts.none")} <code>/alerts</code>.`;
    target.replaceChildren(empty);
    return;
  }

  const fragment = document.createDocumentFragment();
  normalizedAlerts.forEach((alert) => {
    const item = document.createElement("div");
    item.className = "alert-item";

    const title = document.createElement("div");
    title.className = "alert-title";

    const name = document.createElement("div");
    name.textContent = alert.name || alert.rule || t("alerts.alert");

    const pill = document.createElement("span");
    pill.className = `alert-pill ${alert.severity === "warning" ? "warn" : ""}`;
    pill.textContent = alert.severity || t("alerts.active");

    title.append(name, pill);

    const meta = document.createElement("div");
    meta.className = "alert-meta";
    const current = firstDefined(alert.current_value, alert.value);
    const threshold = firstDefined(alert.threshold, alert.limit);
    const duration = alert.duration || alert.elapsed || "";
    meta.textContent = [
      current !== undefined ? `${t("alerts.current")} ${current}` : null,
      threshold !== undefined ? `${t("alerts.threshold")} ${threshold}` : null,
      duration ? `${t("alerts.for")} ${duration}` : null,
    ]
      .filter(Boolean)
      .join(" | ");

    item.append(title, meta);
    fragment.appendChild(item);
  });
  target.replaceChildren(fragment);
}

function renderWindowCard(window) {
  const card = document.createElement("article");
  card.className = "window-card";

  const head = document.createElement("div");
  head.className = "window-head";

  const name = document.createElement("h3");
  name.className = "window-name";
  name.textContent = t(window.labelKey);

  const meta = document.createElement("div");
  meta.className = "window-meta";
  meta.textContent = window.source === "placeholder" ? t("window.awaiting") : t("window.rolling");

  head.append(name, meta);

  const stats = document.createElement("div");
  stats.className = "window-stats";

  const fields = [
    [t("window.events"), formatInt(window.total)],
    [t("window.qps"), metricText(firstDefined(window.qps, window.rate, window.throughput_qps), (value) => formatFloat(value, 2), " qps")],
    [t("metric.errorRate"), formatPercent(window.error_rate)],
    [t("metric.avgLatency"), metricText(window.latency_avg_ms, formatFloat, " ms")],
    [t("latency.p95"), metricText(window.latency_p95_ms, formatInt, " ms")],
    [t("latency.p99"), metricText(window.latency_p99_ms, formatInt, " ms")],
    [t("window.errors"), formatInt(window.errors)],
  ];

  fields.forEach(([label, value]) => {
    const stat = document.createElement("div");
    stat.className = "window-stat";

    const statLabel = document.createElement("div");
    statLabel.className = "window-stat-label";
    statLabel.textContent = label;

    const statValue = document.createElement("div");
    statValue.className = "window-stat-value";
    statValue.textContent = value;

    stat.append(statLabel, statValue);
    stats.appendChild(stat);
  });

  card.append(head, stats);
  return card;
}

function renderMetrics(metrics, recordHistory = true) {
  latestMetrics = metrics;
  if (recordHistory) {
    pushMetricHistory(metrics);
  }
  renderOverview(metrics);
  renderStatusDonut(metrics.status_counts);
  renderSparkline();
  setText(ids.total, formatInt(metrics.total));
  setText(ids.valid, formatInt(metrics.valid));
  setText(ids.invalid, formatInt(metrics.invalid));
  setText(ids.errors, formatInt(metrics.errors));
  setText(ids.errorRate, formatPercent(metrics.error_rate));
  setText(ids.latencyAvg, metricText(metrics.latency_avg_ms, formatFloat, " ms"));
  setText(ids.latencyP50, metricText(
    firstDefined(metrics.latency_p50_ms, metrics.p50_latency_ms, metrics.latency_median_ms),
    formatInt,
    " ms",
  ));
  setText(ids.latencyP95, metricText(metrics.latency_p95_ms, formatInt, " ms"));
  setText(ids.latencyP99, metricText(firstDefined(metrics.latency_p99_ms, metrics.p99_latency_ms), formatInt, " ms"));
  setText(ids.latencyPeak, metricText(firstDefined(metrics.latency_max_ms, metrics.latency_peak_ms), formatInt, " ms"));
  setText(ids.latencyMax, metricText(metrics.latency_max_ms, formatInt, " ms"));

  const windowCards = WINDOW_CONFIG.map((windowConfig) => {
    const windowMetrics = getWindowMetrics(metrics, windowConfig.key, windowConfig.aliases);
    return {
      ...windowConfig,
      ...(windowMetrics || {}),
      source: windowMetrics ? windowConfig.key : "placeholder",
    };
  });
  const windowSignature = JSON.stringify({ language: currentLanguage, windowCards });
  if (setSignature("window-grid", windowSignature)) {
    const fragment = document.createDocumentFragment();
    windowCards.forEach((windowCard) => {
      fragment.appendChild(renderWindowCard(windowCard));
    });
    ids.windowGrid.replaceChildren(fragment);
  }

  const statusItems = Object.entries(metrics.status_counts || {}).map(([status, count]) => ({
    label: String(status),
    value: count,
  }));
  renderBars(ids.statusChart, statusItems, true, { cacheKey: "status-bars" });

  const pathItems = (metrics.top_paths || []).map((item) => ({
    label: item.path,
    value: item.count,
  }));
  renderBars(ids.pathsChart, pathItems, false, { cacheKey: "path-bars", compactLabels: true, limit: 10 });

  const pipelineEntries = buildPipelineEntries(metrics);
  renderKeyValueList(ids.pipelineStats, pipelineEntries, t("empty.pipeline"));
  renderCompare();

  const alerts = metrics.alerts || metrics.active_alerts || [];
  renderAlerts(ids.alertsPanel, Array.isArray(alerts) ? alerts : []);

  setText(ids.refreshStatus, `${t("status.updated")} ${new Date().toLocaleTimeString(currentLanguage === "zh" ? "zh-CN" : "en-US")}`);
}

function buildPipelineEntries(metrics) {
  const pipelineStats = metrics.pipeline || metrics.pipeline_stats || {};
  const importSnapshot = importPreview && toNumber(pipelineStats.queue_capacity) === 0;
  renderPipelineHeading(importSnapshot);

  if (importSnapshot) {
    const total = toNumber(metrics.total);
    const invalid = toNumber(firstDefined(metrics.invalid, pipelineStats.parse_failures));
    return [
      [t("pipeline.importMode"), t("pipeline.importModeValue")],
      [t("pipeline.inputLines"), formatInt(total)],
      [t("pipeline.parsedEvents"), formatInt(metrics.valid)],
      [t("pipeline.invalidLines"), formatInt(invalid)],
      [t("pipeline.invalidRate"), formatPercent(total > 0 ? invalid / total : 0)],
      [t("pipeline.anomalySamples"), formatInt(currentAnomalies.length)],
    ];
  }

  const pipelineEntries = [];
  const seenLabels = new Set();

  PIPELINE_FIELDS.forEach(([field, labelKey]) => {
    if (seenLabels.has(labelKey)) {
      return;
    }

    const value = pipelineStats[field] ?? metrics[field];
    if (value === undefined || value === null) {
      return;
    }

    seenLabels.add(labelKey);
    if (field === "drop_rate") {
      pipelineEntries.push([t(labelKey), formatPercent(value)]);
      return;
    }

    pipelineEntries.push([t(labelKey), formatInt(value)]);
  });

  return pipelineEntries;
}

function renderPipelineHeading(importSnapshot) {
  setText(ids.pipelineKicker, importSnapshot ? t("pipeline.importKicker") : t("pipeline.kicker"));
  setText(ids.pipelineTitle, importSnapshot ? t("pipeline.importTitle") : t("pipeline.title"));
  setText(ids.pipelineNote, importSnapshot ? t("pipeline.importNote") : t("pipeline.note"));
}

function calculateHealth(metrics) {
  if (!metrics) {
    return 100;
  }

  const total = toNumber(metrics.total);
  const valid = toNumber(metrics.valid);
  const invalid = toNumber(metrics.invalid);
  const errorRate = toNumber(metrics.error_rate);
  const invalidPenalty = total > 0 ? invalid / total : 0;
  const validRatio = total > 0 ? valid / total : 1;
  return Math.round(clamp(100 - errorRate * 100 - invalidPenalty * 45 - (1 - validRatio) * 20, 0, 100));
}

function topPathLines(metrics) {
  return (metrics?.top_paths || [])
    .slice(0, 5)
    .map((item, index) => `${index + 1}. ${item.path}: ${formatNumber(item.count)}`)
    .join("\n");
}

function anomalyLines() {
  if (!currentAnomalies.length) {
    return `- ${t("anomaly.empty")}`;
  }

  return currentAnomalies
    .map((event) => `- ${event.status >= 500 ? t("anomaly.error") : t("anomaly.slow")} ${event.method || ""} ${event.path} | ${t("anomaly.status")} ${event.status} | ${t("anomaly.latency")} ${formatInt(event.latency_ms)} ms`)
    .join("\n");
}

function buildReport(format) {
  if (!latestMetrics) {
    return "";
  }

  const report = {
    title: "logscope analysis report",
    generated_at: new Date().toISOString(),
    health_score: calculateHealth(latestMetrics),
    metrics: {
      total: toNumber(latestMetrics.total),
      valid: toNumber(latestMetrics.valid),
      invalid: toNumber(latestMetrics.invalid),
      errors: toNumber(latestMetrics.errors),
      error_rate: toNumber(latestMetrics.error_rate),
      latency_avg_ms: toNumber(latestMetrics.latency_avg_ms),
      latency_p95_ms: toNumber(latestMetrics.latency_p95_ms),
      latency_p99_ms: toNumber(firstDefined(latestMetrics.latency_p99_ms, latestMetrics.p99_latency_ms)),
      latency_max_ms: toNumber(latestMetrics.latency_max_ms),
    },
    top_paths: latestMetrics.top_paths || [],
    anomalies: currentAnomalies,
  };

  if (format === "json") {
    return JSON.stringify(report, null, 2);
  }

  return [
    "# logscope Analysis Report",
    "",
    `- Generated at: ${report.generated_at}`,
    `- Health score: ${report.health_score}%`,
    `- Total lines: ${formatInt(report.metrics.total)}`,
    `- Valid events: ${formatInt(report.metrics.valid)}`,
    `- Invalid lines: ${formatInt(report.metrics.invalid)}`,
    `- Errors: ${formatInt(report.metrics.errors)}`,
    `- Error rate: ${formatPercent(report.metrics.error_rate)}`,
    `- Average latency: ${formatFloat(report.metrics.latency_avg_ms)} ms`,
    `- P95 latency: ${formatInt(report.metrics.latency_p95_ms)} ms`,
    `- P99 latency: ${formatInt(report.metrics.latency_p99_ms)} ms`,
    "",
    "## Top Paths",
    topPathLines(latestMetrics) || t("empty.noData"),
    "",
    "## Anomaly Samples",
    anomalyLines(),
    "",
  ].join("\n");
}

function downloadReport(format) {
  const content = buildReport(format);
  if (!content) {
    setText(ids.reportPreview, t("report.empty"));
    return;
  }

  const extension = format === "json" ? "json" : "md";
  const mime = format === "json" ? "application/json" : "text/markdown";
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `logscope-report-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.${extension}`;
  link.click();
  URL.revokeObjectURL(url);
  setText(ids.reportPreview, `${t("report.ready")}: ${link.download}`);
}

function scheduleRenderMetrics(metrics, recordHistory = true) {
  latestMetrics = metrics;
  if (pendingRenderFrame) {
    cancelAnimationFrame(pendingRenderFrame);
    pendingRenderResolve?.();
  }

  return new Promise((resolve) => {
    pendingRenderResolve = resolve;
    pendingRenderFrame = requestAnimationFrame(() => {
      pendingRenderFrame = 0;
      pendingRenderResolve = null;
      renderMetrics(metrics, recordHistory);
      resolve();
    });
  });
}

function flashDashboard() {
  document.querySelectorAll(".card").forEach((card) => {
    card.classList.remove("flash");
    void card.offsetWidth;
    card.classList.add("flash");
  });
}

function updateDemoStage(index) {
  demoStageIndex = index;
  const stage = DEMO_STAGES[index];
  const progress = stage ? ((index + 1) / DEMO_STAGES.length) * 100 : 0;
  ids.demoTimelineItems.forEach((item) => {
    const step = Number(item.dataset.demoStep);
    item.classList.toggle("active", step === index);
    item.classList.toggle("done", step < index);
  });
  ids.demoStageProgress.style.width = `${progress}%`;
  setText(ids.demoStageLabel, stage ? t(`demo.${stage.key}`) : t("demo.idle"));
  setText(ids.demoStageText, stage ? t(`demo.${stage.key}Text`) : t("demo.idle"));
  if (stage) {
    focusDemoArea(stage.key);
  }
}

function setDemoRunning(running) {
  demoRunning = running;
  ids.demoPlay.disabled = running;
  ids.demoStop.disabled = !running;
  ids.demoPlay.classList.toggle("loading", running);
  ids.sparklineCard.classList.toggle("loading", running);
  setText(ids.importStatus, running ? t("demo.running") : ids.importStatus.textContent);
}

function stopDemo() {
  if (demoTimer) {
    window.clearTimeout(demoTimer);
    demoTimer = null;
    const resolve = demoSleepResolve;
    demoSleepResolve = null;
    resolve?.();
  }
  setDemoRunning(false);
  updateDemoStage(-1);
}

async function runDemoMode() {
  if (demoRunning) {
    return;
  }

  setDemoRunning(true);
  importPreview = true;
  ids.importFormat.value = "auto";
  let completed = false;
  await nextFrame();

  try {
    for (let index = 0; index < DEMO_STAGES.length; index += 1) {
      if (!demoRunning) {
        break;
      }

      const stage = DEMO_STAGES[index];
      updateDemoStage(index);
      const content = stage.sample();
      runWhenIdle(() => {
        if (demoRunning && demoStageIndex === index) {
          ids.importContent.value = content;
        }
      });
      updateAnalysisSource(content, "auto");
      await analyzeImport(content, "auto", {
        loadingManaged: true,
        skipAnomalyUpdate: true,
        historyLabel: `${t("demo.title")} · ${t(`demo.${stage.key}`)}`,
      });
      await sleep(stage.duration);
    }

    if (demoRunning) {
      ids.importStatus.textContent = t("demo.done");
      completed = true;
    }
  } finally {
    setDemoRunning(false);
    if (completed) {
      ids.demoTimelineItems.forEach((item) => item.classList.add("done"));
    }
  }
}

function setSampleLoading(activeButton, loading) {
  ids.sparklineCard.classList.toggle("loading", loading);
  ids.demoSampleButtons.forEach((button) => {
    button.classList.toggle("loading", button === activeButton && loading);
    button.classList.toggle("active", button === activeButton && !loading);
    button.disabled = loading;
  });
}

async function analyzeImport(content, format, options = {}) {
  const trimmedContent = content.trim();
  if (!trimmedContent) {
    ids.importStatus.textContent = t("import.empty");
    return;
  }

  ids.importSubmit.disabled = true;
  if (options.button && !options.loadingManaged) {
    setSampleLoading(options.button, true);
  }
  ids.importStatus.textContent = t("import.analyzing");

  try {
    const response = await fetch("/imports", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        format,
        content: trimmedContent,
      }),
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || `HTTP ${response.status}`);
    }

    metricHistory = [];
    if (!options.skipAnomalyUpdate) {
      updateAnalysisSource(trimmedContent, format);
    }
    await scheduleRenderMetrics(payload.metrics);
    flashDashboard();
    importPreview = true;
    if (options.historyLabel) {
      pushAnalysisSnapshot(options.historyLabel);
    }
    ids.importStatus.textContent = `${t("import.done")}: ${payload.lines} ${t("import.lines")}`;
  } catch (error) {
    ids.importStatus.textContent = `${t("import.failed")}: ${error.message}`;
  } finally {
    ids.importSubmit.disabled = false;
    if (options.button && !options.loadingManaged) {
      setSampleLoading(options.button, false);
    }
  }
}

async function refresh() {
  if (importPreview) {
    return;
  }

  try {
    const response = await fetch("/metrics", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const metrics = await response.json();
    await scheduleRenderMetrics(metrics);
  } catch (error) {
    ids.refreshStatus.textContent = `${t("status.refreshFailed")}: ${error.message}`;
  }
}

function applyTranslations() {
  document.documentElement.lang = currentLanguage === "zh" ? "zh-CN" : "en";
  document.title = t("app.title");
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-html]").forEach((node) => {
    node.innerHTML = t(node.dataset.i18nHtml);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    node.placeholder = t(node.dataset.i18nPlaceholder);
  });
  ids.languageButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.langOption === currentLanguage);
    button.setAttribute("aria-pressed", String(button.dataset.langOption === currentLanguage));
  });
  if (latestMetrics) {
    clearRenderCache();
    scheduleRenderMetrics(latestMetrics, false);
  }
  renderAnomalies(currentAnomalies);
  renderInsights();
  renderServices();
  renderReplay();
  updateDemoStage(demoStageIndex);
}

ids.languageButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentLanguage = button.dataset.langOption === "en" ? "en" : "zh";
    localStorage.setItem("logscope-language", currentLanguage);
    applyTranslations();
  });
});

function movePathTooltip(event) {
  const margin = 16;
  const width = ids.pathTooltip.offsetWidth || 320;
  const height = ids.pathTooltip.offsetHeight || 44;
  const x = Math.min(event.clientX + 14, window.innerWidth - width - margin);
  const y = Math.min(event.clientY + 14, window.innerHeight - height - margin);
  ids.pathTooltip.style.left = `${Math.max(margin, x)}px`;
  ids.pathTooltip.style.top = `${Math.max(margin, y)}px`;
}

document.addEventListener("mouseover", (event) => {
  const label = event.target.closest?.("[data-full-path]");
  if (!label) {
    return;
  }

  ids.pathTooltip.textContent = label.dataset.fullPath;
  ids.pathTooltip.hidden = false;
  movePathTooltip(event);
});

document.addEventListener("mousemove", (event) => {
  if (!ids.pathTooltip.hidden) {
    movePathTooltip(event);
  }
});

document.addEventListener("mouseout", (event) => {
  if (event.target.closest?.("[data-full-path]")) {
    ids.pathTooltip.hidden = true;
  }
});

ids.importFile.addEventListener("change", async () => {
  const [file] = ids.importFile.files;
  if (!file) {
    return;
  }

  ids.importStatus.textContent = t("import.loadingFile");
  ids.importContent.value = await file.text();
  ids.importStatus.textContent = t("import.readyFile");
});

ids.importSubmit.addEventListener("click", async () => {
  await analyzeImport(ids.importContent.value, ids.importFormat.value, { historyLabel: t("import.title") });
});

ids.importLive.addEventListener("click", () => {
  stopDemo();
  importPreview = false;
  clearAnalysisSource();
  ids.importStatus.textContent = t("import.liveMode");
  refresh();
});

ids.bigScreenToggle.addEventListener("click", () => {
  toggleBigScreen();
});

ids.viewModeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setViewMode(button.dataset.viewMode || "presentation");
  });
});

ids.compareSave.addEventListener("click", () => {
  if (!latestMetrics) {
    return;
  }

  baselineMetrics = {
    total: toNumber(latestMetrics.total),
    errors: toNumber(latestMetrics.errors),
    errorRate: toNumber(latestMetrics.error_rate),
    p95: toNumber(latestMetrics.latency_p95_ms),
  };
  renderCompare();
});

ids.compareClear.addEventListener("click", () => {
  baselineMetrics = null;
  renderCompare();
});

ids.demoPlay.addEventListener("click", () => {
  runDemoMode();
});

ids.demoStop.addEventListener("click", () => {
  stopDemo();
  ids.importStatus.textContent = t("demo.idle");
});

ids.exportMarkdown.addEventListener("click", () => {
  downloadReport("markdown");
});

ids.exportJson.addEventListener("click", () => {
  downloadReport("json");
});

ids.demoSampleButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    stopDemo();
    setSampleLoading(button, true);
    ids.importStatus.textContent = t("import.analyzing");
    await nextFrame();

    try {
      const sample = getDemoSample(button.dataset.demoSample);
      if (!sample) {
        return;
      }

      ids.importFormat.value = sample.format;
      runWhenIdle(() => {
        ids.importContent.value = sample.content;
      });

      await analyzeImport(sample.content, sample.format, {
        button,
        loadingManaged: true,
        historyLabel: t(button.dataset.i18n),
      });
    } finally {
      setSampleLoading(button, false);
    }
  });
});

applyTranslations();
renderAnomalies(currentAnomalies);
renderInsights();
renderServices();
renderReplay();
renderCompare();
renderHistory();
setViewMode(currentViewMode);
refresh();
setInterval(refresh, 2000);
