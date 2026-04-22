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
    "pipeline.queueCapacity": "队列容量",
    "pipeline.queueDepth": "队列深度",
    "pipeline.workers": "Worker 数",
    "pipeline.parseFailures": "解析失败",
    "pipeline.droppedLines": "丢弃行数",
    "pipeline.dropRate": "丢弃率",
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
    "pipeline.queueCapacity": "Queue Capacity",
    "pipeline.queueDepth": "Queue Depth",
    "pipeline.workers": "Workers",
    "pipeline.parseFailures": "Parse Failures",
    "pipeline.droppedLines": "Dropped Lines",
    "pipeline.dropRate": "Drop Rate",
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

function buildJsonSample(mode, count) {
  const paths = ["/api/orders", "/api/users", "/api/search", "/api/payments/refund", "/api/inventory/reconcile"];
  const services = ["gateway", "auth", "search", "payment", "inventory"];
  const lines = [];

  for (let index = 0; index < count; index += 1) {
    const burst = mode === "error" && index > count * 0.36 && index < count * 0.78;
    const status = burst && index % 3 !== 0 ? [500, 502, 503, 504][index % 4] : [200, 200, 200, 201, 204][index % 5];
    const latency = burst ? 120 + (index % 9) * 38 : 22 + (index % 12) * 7;
    const path = burst && index % 2 === 0 ? "/api/orders/checkout/payment/callback" : paths[index % paths.length];
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

  const pipelineStats = metrics.pipeline || metrics.pipeline_stats || {};
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
  renderKeyValueList(ids.pipelineStats, pipelineEntries, t("empty.pipeline"));

  const alerts = metrics.alerts || metrics.active_alerts || [];
  renderAlerts(ids.alertsPanel, Array.isArray(alerts) ? alerts : []);

  setText(ids.refreshStatus, `${t("status.updated")} ${new Date().toLocaleTimeString(currentLanguage === "zh" ? "zh-CN" : "en-US")}`);
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
    await scheduleRenderMetrics(payload.metrics);
    flashDashboard();
    importPreview = true;
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
  await analyzeImport(ids.importContent.value, ids.importFormat.value);
});

ids.importLive.addEventListener("click", () => {
  importPreview = false;
  ids.importStatus.textContent = t("import.liveMode");
  refresh();
});

ids.demoSampleButtons.forEach((button) => {
  button.addEventListener("click", async () => {
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

      await analyzeImport(sample.content, sample.format, { button, loadingManaged: true });
    } finally {
      setSampleLoading(button, false);
    }
  });
});

applyTranslations();
refresh();
setInterval(refresh, 2000);
