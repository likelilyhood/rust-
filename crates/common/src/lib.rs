use std::collections::BTreeMap;

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Deserialize, Serialize, PartialEq)]
pub struct LogEvent {
    pub timestamp: Option<String>,
    pub path: String,
    pub status: u16,
    pub latency_ms: u64,
    pub method: Option<String>,
    pub service: Option<String>,
}

#[derive(Debug, Clone, Deserialize, Serialize, PartialEq)]
pub struct MetricsResponse {
    pub uptime_secs: u64,
    pub total: u64,
    pub valid: u64,
    pub invalid: u64,
    pub errors: u64,
    pub error_rate: f64,
    pub latency_p50_ms: u64,
    pub latency_avg_ms: f64,
    pub latency_p95_ms: u64,
    pub latency_p99_ms: u64,
    pub latency_max_ms: u64,
    pub status_counts: BTreeMap<u16, u64>,
    pub top_paths: Vec<PathCount>,
    pub pipeline: PipelineStats,
    pub windows: BTreeMap<String, WindowMetrics>,
}

#[derive(Debug, Clone, Deserialize, Serialize, PartialEq, Eq)]
pub struct PathCount {
    pub path: String,
    pub count: u64,
}

#[derive(Debug, Clone, Deserialize, Serialize, PartialEq)]
pub struct WindowMetrics {
    pub total: u64,
    pub valid: u64,
    pub invalid: u64,
    pub errors: u64,
    pub qps: f64,
    pub error_rate: f64,
    pub latency_avg_ms: f64,
    pub latency_p50_ms: u64,
    pub latency_p95_ms: u64,
    pub latency_p99_ms: u64,
    pub latency_max_ms: u64,
}

#[derive(Debug, Clone, Deserialize, Serialize, PartialEq)]
pub struct PipelineStats {
    pub queue_capacity: usize,
    pub queue_len: usize,
    pub workers: usize,
    pub parse_failures: u64,
    pub dropped_lines: u64,
    pub drop_rate: f64,
}

#[derive(Debug, Clone, Deserialize, Serialize, PartialEq)]
pub struct AlertsResponse {
    pub active: Vec<Alert>,
}

#[derive(Debug, Clone, Deserialize, Serialize, PartialEq)]
pub struct Alert {
    pub name: String,
    pub start_ts: Option<String>,
    pub current_value: f64,
    pub threshold: f64,
    pub duration_secs: u64,
}
