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
};

const WINDOW_CONFIG = [
  {
    key: "10s",
    label: "10 Seconds",
    aliases: ["window_10s", "recent_10s"],
  },
  {
    key: "1m",
    label: "1 Minute",
    aliases: ["window_1m", "recent_60s"],
  },
  {
    key: "5m",
    label: "5 Minutes",
    aliases: ["window_5m", "recent_300s"],
  },
];

const PIPELINE_FIELDS = [
  ["queue_capacity", "Queue Capacity"],
  ["queue_len", "Queue Depth"],
  ["queue_depth", "Queue Depth"],
  ["workers", "Workers"],
  ["parse_failures", "Parse Failures"],
  ["dropped_lines", "Dropped Lines"],
  ["drop_rate", "Drop Rate"],
];

function formatNumber(value) {
  return new Intl.NumberFormat().format(value);
}

function formatInt(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "n/a";
  }

  return formatNumber(Number(value));
}

function formatFloat(value, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "n/a";
  }

  return Number(value).toFixed(digits);
}

function formatPercent(value, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "n/a";
  }

  const numeric = Number(value);
  const percent = Math.abs(numeric) <= 1 ? numeric * 100 : numeric;
  return `${percent.toFixed(digits)}%`;
}

function metricText(value, formatter, suffix = "") {
  const formatted = formatter(value);
  return formatted === "n/a" ? formatted : `${formatted}${suffix}`;
}

function firstDefined(...values) {
  return values.find((value) => value !== undefined && value !== null);
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

function renderBars(target, items, dangerCutoff = false) {
  target.innerHTML = "";

  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No data yet";
    target.appendChild(empty);
    return;
  }

  const maxValue = Math.max(...items.map((item) => item.value), 1);

  items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "bar-row";

    const label = document.createElement("div");
    label.textContent = item.label;

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
    value.textContent = formatNumber(item.value);

    row.append(label, track, value);
    target.appendChild(row);
  });
}

function renderKeyValueList(target, entries, emptyMessage) {
  target.innerHTML = "";

  if (!entries.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = emptyMessage;
    target.appendChild(empty);
    return;
  }

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
    target.appendChild(row);
  });
}

function renderAlerts(target, alerts) {
  target.innerHTML = "";

  if (!alerts.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.innerHTML = "No active alerts yet. This panel is ready for <code>/alerts</code> payloads.";
    target.appendChild(empty);
    return;
  }

  alerts.forEach((alert) => {
    const item = document.createElement("div");
    item.className = "alert-item";

    const title = document.createElement("div");
    title.className = "alert-title";

    const name = document.createElement("div");
    name.textContent = alert.name || alert.rule || "Alert";

    const pill = document.createElement("span");
    pill.className = `alert-pill ${alert.severity === "warning" ? "warn" : ""}`;
    pill.textContent = alert.severity || "active";

    title.append(name, pill);

    const meta = document.createElement("div");
    meta.className = "alert-meta";
    const current = firstDefined(alert.current_value, alert.value);
    const threshold = firstDefined(alert.threshold, alert.limit);
    const duration = alert.duration || alert.elapsed || "";
    meta.textContent = [
      current !== undefined ? `current ${current}` : null,
      threshold !== undefined ? `threshold ${threshold}` : null,
      duration ? `for ${duration}` : null,
    ]
      .filter(Boolean)
      .join(" | ");

    item.append(title, meta);
    target.appendChild(item);
  });
}

function renderWindowCard(window) {
  const card = document.createElement("article");
  card.className = "window-card";

  const head = document.createElement("div");
  head.className = "window-head";

  const name = document.createElement("h3");
  name.className = "window-name";
  name.textContent = window.label;

  const meta = document.createElement("div");
  meta.className = "window-meta";
  meta.textContent = window.source === "placeholder" ? "Awaiting backend window" : "Rolling window";

  head.append(name, meta);

  const stats = document.createElement("div");
  stats.className = "window-stats";

  const fields = [
    ["Events", formatInt(window.total)],
    ["QPS", metricText(firstDefined(window.qps, window.rate, window.throughput_qps), (value) => formatFloat(value, 2), " qps")],
    ["Error Rate", formatPercent(window.error_rate)],
    ["Avg Latency", metricText(window.latency_avg_ms, formatFloat, " ms")],
    ["P95 Latency", metricText(window.latency_p95_ms, formatInt, " ms")],
    ["P99 Latency", metricText(window.latency_p99_ms, formatInt, " ms")],
    ["Errors", formatInt(window.errors)],
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

function renderMetrics(metrics) {
  ids.total.textContent = formatInt(metrics.total);
  ids.valid.textContent = formatInt(metrics.valid);
  ids.invalid.textContent = formatInt(metrics.invalid);
  ids.errors.textContent = formatInt(metrics.errors);
  ids.errorRate.textContent = formatPercent(metrics.error_rate);
  ids.latencyAvg.textContent = metricText(metrics.latency_avg_ms, formatFloat, " ms");
  ids.latencyP50.textContent = metricText(
    firstDefined(metrics.latency_p50_ms, metrics.p50_latency_ms, metrics.latency_median_ms),
    formatInt,
    " ms",
  );
  ids.latencyP95.textContent = metricText(metrics.latency_p95_ms, formatInt, " ms");
  ids.latencyP99.textContent = metricText(firstDefined(metrics.latency_p99_ms, metrics.p99_latency_ms), formatInt, " ms");
  ids.latencyPeak.textContent = metricText(firstDefined(metrics.latency_max_ms, metrics.latency_peak_ms), formatInt, " ms");
  ids.latencyMax.textContent = metricText(metrics.latency_max_ms, formatInt, " ms");

  ids.windowGrid.innerHTML = "";
  WINDOW_CONFIG.forEach((windowConfig) => {
    const windowMetrics = getWindowMetrics(metrics, windowConfig.key, windowConfig.aliases);
    ids.windowGrid.appendChild(
      renderWindowCard({
        ...windowConfig,
        ...(windowMetrics || {}),
        source: windowMetrics ? windowConfig.key : "placeholder",
      }),
    );
  });

  const statusItems = Object.entries(metrics.status_counts || {}).map(([status, count]) => ({
    label: String(status),
    value: count,
  }));
  renderBars(ids.statusChart, statusItems, true);

  const pathItems = (metrics.top_paths || []).map((item) => ({
    label: item.path,
    value: item.count,
  }));
  renderBars(ids.pathsChart, pathItems);

  const pipelineStats = metrics.pipeline_stats || {};
  const pipelineEntries = [];
  const seenLabels = new Set();

  PIPELINE_FIELDS.forEach(([field, label]) => {
    if (seenLabels.has(label)) {
      return;
    }

    const value = pipelineStats[field] ?? metrics[field];
    if (value === undefined || value === null) {
      return;
    }

    seenLabels.add(label);
    if (field === "drop_rate") {
      pipelineEntries.push([label, formatPercent(value)]);
      return;
    }

    pipelineEntries.push([label, formatInt(value)]);
  });
  renderKeyValueList(ids.pipelineStats, pipelineEntries, "Pipeline stats will appear here once the backend exposes queue and drop fields.");

  const alerts = metrics.alerts || metrics.active_alerts || [];
  renderAlerts(ids.alertsPanel, Array.isArray(alerts) ? alerts : []);

  ids.refreshStatus.textContent = `Updated ${new Date().toLocaleTimeString()}`;
}

async function refresh() {
  try {
    const response = await fetch("/metrics", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const metrics = await response.json();
    renderMetrics(metrics);
  } catch (error) {
    ids.refreshStatus.textContent = `Refresh failed: ${error.message}`;
  }
}

refresh();
setInterval(refresh, 2000);
