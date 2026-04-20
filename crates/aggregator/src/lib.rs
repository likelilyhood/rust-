use std::{
    collections::{BTreeMap, HashMap, VecDeque},
    time::{Duration, SystemTime},
};

use common::LogEvent;
use common::{MetricsResponse, PathCount, PipelineStats, WindowMetrics};

const MAX_WINDOW: Duration = Duration::from_secs(5 * 60);
const WINDOW_SPECS: [(&str, Duration); 3] = [
    ("10s", Duration::from_secs(10)),
    ("1m", Duration::from_secs(60)),
    ("5m", Duration::from_secs(5 * 60)),
];
const LATENCY_BUCKETS_MS: [u64; 16] = [
    5, 10, 20, 50, 75, 100, 150, 200, 300, 500, 750, 1_000, 1_500, 2_000, 5_000, 10_000,
];

#[derive(Debug, Clone)]
struct Histogram {
    counts: Vec<u64>,
}

impl Histogram {
    fn new() -> Self {
        Self {
            counts: vec![0; LATENCY_BUCKETS_MS.len() + 1],
        }
    }

    fn record(&mut self, latency_ms: u64) {
        let index = LATENCY_BUCKETS_MS
            .iter()
            .position(|bucket| latency_ms <= *bucket)
            .unwrap_or(LATENCY_BUCKETS_MS.len());
        self.counts[index] += 1;
    }

    fn merge_from(&mut self, other: &Histogram) {
        for (left, right) in self.counts.iter_mut().zip(other.counts.iter()) {
            *left += right;
        }
    }

    fn percentile(&self, percentile: f64) -> u64 {
        let total: u64 = self.counts.iter().sum();
        if total == 0 {
            return 0;
        }

        let target = ((total as f64) * percentile).ceil() as u64;
        let mut seen = 0_u64;
        for (index, count) in self.counts.iter().enumerate() {
            seen += *count;
            if seen >= target.max(1) {
                return bucket_upper_bound(index);
            }
        }

        bucket_upper_bound(self.counts.len().saturating_sub(1))
    }
}

impl Default for Histogram {
    fn default() -> Self {
        Self::new()
    }
}

#[derive(Debug, Clone, Default)]
struct WindowSlot {
    second: u64,
    total: u64,
    valid: u64,
    invalid: u64,
    errors: u64,
    latency_sum_ms: u64,
    latency_max_ms: u64,
    histogram: Histogram,
}

#[derive(Debug, Clone)]
pub struct MetricsState {
    started_at: SystemTime,
    total: u64,
    valid: u64,
    invalid: u64,
    errors: u64,
    latency_sum_ms: u64,
    latency_max_ms: u64,
    histogram: Histogram,
    status_counts: BTreeMap<u16, u64>,
    path_counts: HashMap<String, u64>,
    recent_slots: VecDeque<WindowSlot>,
    top_n: usize,
}

impl Default for MetricsState {
    fn default() -> Self {
        Self::new(5)
    }
}

impl MetricsState {
    pub fn new(top_n: usize) -> Self {
        Self {
            started_at: SystemTime::now(),
            total: 0,
            valid: 0,
            invalid: 0,
            errors: 0,
            latency_sum_ms: 0,
            latency_max_ms: 0,
            histogram: Histogram::new(),
            status_counts: BTreeMap::new(),
            path_counts: HashMap::new(),
            recent_slots: VecDeque::new(),
            top_n,
        }
    }

    pub fn record_invalid(&mut self) {
        self.record_invalid_at(SystemTime::now());
    }

    pub fn update(&mut self, event: &LogEvent) {
        self.update_at(event, SystemTime::now());
    }

    pub fn snapshot(&self, pipeline: PipelineStats) -> MetricsResponse {
        self.snapshot_at(SystemTime::now(), pipeline)
    }

    fn record_invalid_at(&mut self, observed_at: SystemTime) {
        self.total += 1;
        self.invalid += 1;
        let slot = self.slot_mut(observed_at);
        slot.total += 1;
        slot.invalid += 1;
        self.prune_old_slots(seconds_since_epoch(observed_at));
    }

    fn update_at(&mut self, event: &LogEvent, observed_at: SystemTime) {
        self.total += 1;
        self.valid += 1;

        let is_error = event.status >= 500;
        if is_error {
            self.errors += 1;
        }

        self.latency_sum_ms += event.latency_ms;
        self.latency_max_ms = self.latency_max_ms.max(event.latency_ms);
        self.histogram.record(event.latency_ms);
        *self.status_counts.entry(event.status).or_insert(0) += 1;
        *self.path_counts.entry(event.path.clone()).or_insert(0) += 1;

        let slot = self.slot_mut(observed_at);
        slot.total += 1;
        slot.valid += 1;
        if is_error {
            slot.errors += 1;
        }
        slot.latency_sum_ms += event.latency_ms;
        slot.latency_max_ms = slot.latency_max_ms.max(event.latency_ms);
        slot.histogram.record(event.latency_ms);

        self.prune_old_slots(seconds_since_epoch(observed_at));
    }

    fn snapshot_at(&self, now: SystemTime, pipeline: PipelineStats) -> MetricsResponse {
        let error_rate = rate(self.errors, self.valid);
        let latency_avg_ms = average(self.latency_sum_ms, self.valid);

        let mut top_paths: Vec<PathCount> = self
            .path_counts
            .iter()
            .map(|(path, count)| PathCount {
                path: path.clone(),
                count: *count,
            })
            .collect();
        top_paths.sort_by(|a, b| b.count.cmp(&a.count).then_with(|| a.path.cmp(&b.path)));
        top_paths.truncate(self.top_n);

        let mut windows = BTreeMap::new();
        for (label, duration) in WINDOW_SPECS {
            windows.insert(label.to_string(), self.window_snapshot(now, duration));
        }

        MetricsResponse {
            uptime_secs: now
                .duration_since(self.started_at)
                .unwrap_or_default()
                .as_secs(),
            total: self.total,
            valid: self.valid,
            invalid: self.invalid,
            errors: self.errors,
            error_rate,
            latency_p50_ms: self.histogram.percentile(0.50),
            latency_avg_ms,
            latency_p95_ms: self.histogram.percentile(0.95),
            latency_p99_ms: self.histogram.percentile(0.99),
            latency_max_ms: self.latency_max_ms,
            status_counts: self.status_counts.clone(),
            top_paths,
            pipeline,
            windows,
        }
    }

    fn window_snapshot(&self, now: SystemTime, duration: Duration) -> WindowMetrics {
        let now_secs = seconds_since_epoch(now);
        let window_secs = duration.as_secs();
        let cutoff = now_secs.saturating_sub(window_secs.saturating_sub(1));

        let mut total = 0;
        let mut valid = 0;
        let mut invalid = 0;
        let mut errors = 0;
        let mut latency_sum_ms = 0_u64;
        let mut latency_max_ms = 0_u64;
        let mut histogram = Histogram::new();

        for slot in self
            .recent_slots
            .iter()
            .filter(|slot| slot.second >= cutoff)
        {
            total += slot.total;
            valid += slot.valid;
            invalid += slot.invalid;
            errors += slot.errors;
            latency_sum_ms += slot.latency_sum_ms;
            latency_max_ms = latency_max_ms.max(slot.latency_max_ms);
            histogram.merge_from(&slot.histogram);
        }

        WindowMetrics {
            total,
            valid,
            invalid,
            errors,
            qps: total as f64 / window_secs.max(1) as f64,
            error_rate: rate(errors, valid),
            latency_avg_ms: average(latency_sum_ms, valid),
            latency_p50_ms: histogram.percentile(0.50),
            latency_p95_ms: histogram.percentile(0.95),
            latency_p99_ms: histogram.percentile(0.99),
            latency_max_ms,
        }
    }

    fn slot_mut(&mut self, observed_at: SystemTime) -> &mut WindowSlot {
        let second = seconds_since_epoch(observed_at);
        if self.recent_slots.back().map(|slot| slot.second) != Some(second) {
            self.recent_slots.push_back(WindowSlot {
                second,
                ..WindowSlot::default()
            });
        }

        self.recent_slots
            .back_mut()
            .expect("recent slots should contain current second")
    }

    fn prune_old_slots(&mut self, now_secs: u64) {
        let cutoff = now_secs.saturating_sub(MAX_WINDOW.as_secs());
        while self
            .recent_slots
            .front()
            .is_some_and(|slot| slot.second < cutoff)
        {
            self.recent_slots.pop_front();
        }
    }
}

fn seconds_since_epoch(ts: SystemTime) -> u64 {
    ts.duration_since(SystemTime::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
}

fn average(sum: u64, count: u64) -> f64 {
    if count == 0 {
        0.0
    } else {
        sum as f64 / count as f64
    }
}

fn rate(numerator: u64, denominator: u64) -> f64 {
    if denominator == 0 {
        0.0
    } else {
        numerator as f64 / denominator as f64
    }
}

fn bucket_upper_bound(index: usize) -> u64 {
    LATENCY_BUCKETS_MS
        .get(index)
        .copied()
        .unwrap_or(LATENCY_BUCKETS_MS.last().copied().unwrap_or(0))
}

#[cfg(test)]
mod tests {
    use std::time::{Duration, SystemTime};

    use common::{LogEvent, PipelineStats};

    use super::MetricsState;

    fn event(path: &str, status: u16, latency_ms: u64) -> LogEvent {
        LogEvent {
            timestamp: Some("2026-04-20T12:00:00Z".to_string()),
            path: path.to_string(),
            status,
            latency_ms,
            method: Some("GET".to_string()),
            service: Some("gateway".to_string()),
        }
    }

    fn pipeline() -> PipelineStats {
        PipelineStats {
            queue_capacity: 1024,
            queue_len: 8,
            workers: 4,
            parse_failures: 2,
            dropped_lines: 0,
            drop_rate: 0.0,
        }
    }

    #[test]
    fn aggregates_totals_rates_and_uptime() {
        let mut state = MetricsState::new(3);
        let start = SystemTime::UNIX_EPOCH + Duration::from_secs(1_000);
        state.started_at = start;
        let now = start + Duration::from_secs(42);

        state.update_at(&event("/ok", 200, 10), now);
        state.update_at(&event("/err", 503, 90), now);
        state.record_invalid_at(now);

        let snapshot = state.snapshot_at(now, pipeline());
        assert_eq!(snapshot.uptime_secs, 42);
        assert_eq!(snapshot.total, 3);
        assert_eq!(snapshot.valid, 2);
        assert_eq!(snapshot.invalid, 1);
        assert_eq!(snapshot.errors, 1);
        assert_eq!(snapshot.latency_max_ms, 90);
        assert!(snapshot.latency_p50_ms >= 10);
        assert!(snapshot.latency_p95_ms >= 90);
        assert!((snapshot.latency_avg_ms - 50.0).abs() < f64::EPSILON);
        assert!((snapshot.error_rate - 0.5).abs() < f64::EPSILON);
        assert_eq!(snapshot.pipeline.parse_failures, 2);
    }

    #[test]
    fn returns_top_paths_in_descending_order() {
        let mut state = MetricsState::new(2);
        let now = SystemTime::UNIX_EPOCH + Duration::from_secs(1_000);
        state.update_at(&event("/alpha", 200, 10), now);
        state.update_at(&event("/beta", 200, 20), now);
        state.update_at(&event("/beta", 200, 30), now);
        state.update_at(&event("/gamma", 200, 40), now);
        state.update_at(&event("/gamma", 200, 50), now);
        state.update_at(&event("/gamma", 200, 60), now);

        let snapshot = state.snapshot_at(now, pipeline());
        assert_eq!(snapshot.top_paths.len(), 2);
        assert_eq!(snapshot.top_paths[0].path, "/gamma");
        assert_eq!(snapshot.top_paths[0].count, 3);
        assert_eq!(snapshot.top_paths[1].path, "/beta");
        assert_eq!(snapshot.top_paths[1].count, 2);
    }

    #[test]
    fn computes_tumbling_windows() {
        let mut state = MetricsState::new(3);
        let base = SystemTime::UNIX_EPOCH + Duration::from_secs(10_000);

        state.update_at(&event("/old", 500, 300), base - Duration::from_secs(301));
        state.record_invalid_at(base - Duration::from_secs(120));
        state.update_at(&event("/10s-a", 200, 20), base - Duration::from_secs(9));
        state.update_at(&event("/10s-b", 503, 80), base - Duration::from_secs(5));
        state.update_at(&event("/1m", 200, 45), base - Duration::from_secs(40));

        let snapshot = state.snapshot_at(base, pipeline());
        let ten_s = snapshot.windows.get("10s").expect("10s window");
        let one_m = snapshot.windows.get("1m").expect("1m window");
        let five_m = snapshot.windows.get("5m").expect("5m window");

        assert_eq!(ten_s.total, 2);
        assert_eq!(ten_s.errors, 1);
        assert!(ten_s.latency_p95_ms >= 80);
        assert!((ten_s.qps - 0.2).abs() < f64::EPSILON);

        assert_eq!(one_m.total, 3);
        assert_eq!(one_m.valid, 3);
        assert_eq!(one_m.invalid, 0);
        assert!(one_m.latency_p50_ms >= 45);
        assert!(one_m.latency_p99_ms >= 80);

        assert_eq!(five_m.total, 4);
        assert_eq!(five_m.invalid, 1);
        assert_eq!(five_m.errors, 1);
    }
}
