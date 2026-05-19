use std::{
    env,
    net::SocketAddr,
    path::PathBuf,
    sync::{
        Arc,
        atomic::{AtomicU64, Ordering},
    },
    time::{Duration, SystemTime},
};

use aggregator::MetricsState;
use anyhow::{Context, Result, anyhow, bail};
use async_channel::{Receiver, Sender, TrySendError};
use axum::{
    Json, Router,
    extract::State,
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
};
use common::{Alert, AlertsResponse, MetricsResponse, PipelineStats};
use parser::{ParseError, ParserKind, parse_with_kind};
use serde::{Deserialize, Serialize};
use tokio::{
    fs::File,
    io::{self, AsyncBufReadExt, AsyncRead, BufReader},
    net::{TcpListener, TcpStream},
    sync::RwLock,
    time::sleep,
};
use tower_http::services::ServeDir;

type SharedState = Arc<RwLock<MetricsState>>;

#[derive(Debug, Clone)]
struct PipelineStatsHandle {
    queue_capacity: usize,
    workers: usize,
    raw_sender: Sender<String>,
    received_lines: Arc<AtomicU64>,
    parse_failures: Arc<AtomicU64>,
    dropped_lines: Arc<AtomicU64>,
}

impl PipelineStatsHandle {
    fn snapshot(&self) -> PipelineStats {
        let received_lines = self.received_lines.load(Ordering::Relaxed);
        let dropped_lines = self.dropped_lines.load(Ordering::Relaxed);

        PipelineStats {
            queue_capacity: self.queue_capacity,
            queue_len: self.raw_sender.len(),
            workers: self.workers,
            parse_failures: self.parse_failures.load(Ordering::Relaxed),
            dropped_lines,
            drop_rate: if received_lines == 0 {
                0.0
            } else {
                dropped_lines as f64 / received_lines as f64
            },
        }
    }
}

#[derive(Debug, Clone)]
struct AppState {
    metrics: SharedState,
    pipeline: PipelineStatsHandle,
    ingest: IngestController,
    alerts: Arc<RwLock<Vec<Alert>>>,
    top_n: usize,
}

#[derive(Debug)]
struct Config {
    addr: SocketAddr,
    input: InputSource,
    tcp: Option<SocketAddr>,
    format: ParserKind,
    top_n: usize,
    workers: usize,
    queue_capacity: usize,
    drop_strategy: DropStrategy,
    sample_n: usize,
    error_rate_threshold: f64,
    error_rate_duration_secs: u64,
    p95_threshold_ms: u64,
    p95_duration_secs: u64,
}

#[derive(Debug)]
enum InputSource {
    Stdin,
    File(PathBuf),
}

#[derive(Debug, Clone, Copy)]
enum DropStrategy {
    Block,
    DropNewest,
    DropOldest,
    Sample1InN,
}

enum ParsedItem {
    Event(common::LogEvent),
    Invalid,
}

#[derive(Debug, Deserialize)]
struct ImportRequest {
    content: String,
    format: Option<String>,
}

#[derive(Debug, Serialize)]
struct ImportResponse {
    format: String,
    lines: u64,
    metrics: MetricsResponse,
}

#[derive(Debug, Deserialize)]
struct LiveIngestRequest {
    content: String,
}

#[derive(Debug, Serialize)]
struct LiveIngestResponse {
    accepted_lines: u64,
    status: &'static str,
}

#[derive(Debug, Serialize)]
struct ErrorResponse {
    error: String,
}

#[derive(Debug, Clone)]
struct IngestController {
    sender: Sender<String>,
    receiver: Receiver<String>,
    received_lines: Arc<AtomicU64>,
    dropped_lines: Arc<AtomicU64>,
    drop_strategy: DropStrategy,
    sample_n: usize,
}

impl IngestController {
    async fn submit(&self, line: String, line_no: u64) -> Result<()> {
        self.received_lines.fetch_add(1, Ordering::Relaxed);

        if matches!(self.drop_strategy, DropStrategy::Sample1InN)
            && self.sample_n > 1
            && !(line_no - 1).is_multiple_of(self.sample_n as u64)
        {
            self.dropped_lines.fetch_add(1, Ordering::Relaxed);
            return Ok(());
        }

        match self.drop_strategy {
            DropStrategy::Block | DropStrategy::Sample1InN => {
                self.sender
                    .send(line)
                    .await
                    .map_err(|_| anyhow!("ingestion channel closed"))?;
            }
            DropStrategy::DropNewest => {
                if self.sender.try_send(line).is_err() {
                    self.dropped_lines.fetch_add(1, Ordering::Relaxed);
                }
            }
            DropStrategy::DropOldest => {
                let mut pending = Some(line);
                while let Some(item) = pending.take() {
                    match self.sender.try_send(item) {
                        Ok(()) => break,
                        Err(TrySendError::Closed(_)) => {
                            return Err(anyhow!("ingestion channel closed"));
                        }
                        Err(TrySendError::Full(item)) => {
                            if self.receiver.try_recv().is_ok() {
                                self.dropped_lines.fetch_add(1, Ordering::Relaxed);
                                pending = Some(item);
                            } else {
                                self.dropped_lines.fetch_add(1, Ordering::Relaxed);
                                break;
                            }
                        }
                    }
                }
            }
        }

        Ok(())
    }
}

#[derive(Debug, Clone)]
struct AlertConfig {
    error_rate_threshold: f64,
    error_rate_duration_secs: u64,
    p95_threshold_ms: u64,
    p95_duration_secs: u64,
}

#[derive(Default)]
struct RuleState {
    first_seen: Option<SystemTime>,
}

#[tokio::main]
async fn main() -> Result<()> {
    let config = parse_args(env::args().skip(1).collect())?;
    let metrics = Arc::new(RwLock::new(MetricsState::new(config.top_n)));
    let alerts = Arc::new(RwLock::new(Vec::<Alert>::new()));
    let (raw_sender, raw_receiver) = async_channel::bounded::<String>(config.queue_capacity);
    let (parsed_sender, parsed_receiver) =
        async_channel::bounded::<ParsedItem>(config.queue_capacity);

    let pipeline = PipelineStatsHandle {
        queue_capacity: config.queue_capacity,
        workers: config.workers,
        raw_sender: raw_sender.clone(),
        received_lines: Arc::new(AtomicU64::new(0)),
        parse_failures: Arc::new(AtomicU64::new(0)),
        dropped_lines: Arc::new(AtomicU64::new(0)),
    };

    tokio::spawn(run_aggregator(parsed_receiver, Arc::clone(&metrics)));

    for _ in 0..config.workers {
        let raw_receiver = raw_receiver.clone();
        let parsed_sender = parsed_sender.clone();
        let parse_failures = Arc::clone(&pipeline.parse_failures);
        let parser_kind = config.format;
        tokio::spawn(async move {
            while let Ok(line) = raw_receiver.recv().await {
                match parse_with_kind(parser_kind, &line) {
                    Ok(event) => {
                        if parsed_sender.send(ParsedItem::Event(event)).await.is_err() {
                            break;
                        }
                    }
                    Err(ParseError::EmptyLine) => {}
                    Err(_) => {
                        parse_failures.fetch_add(1, Ordering::Relaxed);
                        if parsed_sender.send(ParsedItem::Invalid).await.is_err() {
                            break;
                        }
                    }
                }
            }
        });
    }
    drop(parsed_sender);

    let ingest = IngestController {
        sender: raw_sender,
        receiver: raw_receiver,
        received_lines: Arc::clone(&pipeline.received_lines),
        dropped_lines: Arc::clone(&pipeline.dropped_lines),
        drop_strategy: config.drop_strategy,
        sample_n: config.sample_n.max(1),
    };

    let stdin_or_file_ingest = ingest.clone();
    let input = config.input;
    tokio::spawn(async move {
        if let Err(error) = ingest_loop(input, stdin_or_file_ingest).await {
            eprintln!("ingestion stopped: {error:#}");
        }
    });

    if let Some(tcp_addr) = config.tcp {
        let tcp_ingest = ingest.clone();
        tokio::spawn(async move {
            if let Err(error) = run_tcp_ingest(tcp_addr, tcp_ingest).await {
                eprintln!("tcp ingestion stopped: {error:#}");
            }
        });
    }

    tokio::spawn(run_alert_monitor(
        Arc::clone(&metrics),
        pipeline.clone(),
        Arc::clone(&alerts),
        AlertConfig {
            error_rate_threshold: config.error_rate_threshold,
            error_rate_duration_secs: config.error_rate_duration_secs,
            p95_threshold_ms: config.p95_threshold_ms,
            p95_duration_secs: config.p95_duration_secs,
        },
    ));

    let app_state = AppState {
        metrics,
        pipeline,
        ingest,
        alerts,
        top_n: config.top_n,
    };
    let app = Router::new()
        .route("/health", get(health_handler))
        .route("/metrics", get(metrics_handler))
        .route("/alerts", get(alerts_handler))
        .route("/imports", post(import_handler))
        .route("/ingest", post(live_ingest_handler))
        .fallback_service(ServeDir::new("web"))
        .with_state(app_state);

    let listener = TcpListener::bind(config.addr).await?;
    println!("logscope server listening on http://{}", config.addr);
    axum::serve(listener, app).await?;
    Ok(())
}

fn parse_args(args: Vec<String>) -> Result<Config> {
    let mut addr: SocketAddr = "127.0.0.1:3000".parse().expect("default addr");
    let mut input = InputSource::Stdin;
    let mut tcp = None;
    let mut format = ParserKind::Auto;
    let mut top_n = 10_usize;
    let mut workers = std::thread::available_parallelism()
        .map(|count| count.get())
        .unwrap_or(4)
        .max(1);
    let mut drop_strategy = DropStrategy::Block;
    let mut sample_n = 10_usize;
    let mut error_rate_threshold = 0.20_f64;
    let mut error_rate_duration_secs = 10_u64;
    let mut p95_threshold_ms = 120_u64;
    let mut p95_duration_secs = 30_u64;

    let mut i = 0;
    while i < args.len() {
        match args[i].as_str() {
            "--addr" => {
                i += 1;
                let value = args.get(i).context("missing value for --addr")?;
                addr = value.parse().context("invalid value for --addr")?;
            }
            "--file" | "--input" => {
                i += 1;
                let value = args.get(i).context("missing value for --file")?;
                input = InputSource::File(PathBuf::from(value));
            }
            "--tcp" => {
                i += 1;
                let value = args.get(i).context("missing value for --tcp")?;
                tcp = Some(value.parse().context("invalid value for --tcp")?);
            }
            "--format" => {
                i += 1;
                let value = args.get(i).context("missing value for --format")?;
                format = parse_format(value)?;
            }
            "--top-n" => {
                i += 1;
                let value = args.get(i).context("missing value for --top-n")?;
                top_n = value.parse().context("invalid value for --top-n")?;
            }
            "--workers" => {
                i += 1;
                let value = args.get(i).context("missing value for --workers")?;
                workers = value.parse().context("invalid value for --workers")?;
            }
            "--drop-strategy" => {
                i += 1;
                let value = args.get(i).context("missing value for --drop-strategy")?;
                drop_strategy = match value.as_str() {
                    "block" => DropStrategy::Block,
                    "drop_newest" => DropStrategy::DropNewest,
                    "drop_oldest" => DropStrategy::DropOldest,
                    "sample_1_in_n" => DropStrategy::Sample1InN,
                    other => bail!("unsupported drop strategy: {other}"),
                };
            }
            "--sample-n" => {
                i += 1;
                let value = args.get(i).context("missing value for --sample-n")?;
                sample_n = value.parse().context("invalid value for --sample-n")?;
            }
            "--error-rate-threshold" => {
                i += 1;
                let value = args
                    .get(i)
                    .context("missing value for --error-rate-threshold")?;
                error_rate_threshold = value
                    .parse()
                    .context("invalid value for --error-rate-threshold")?;
            }
            "--error-rate-duration" => {
                i += 1;
                let value = args
                    .get(i)
                    .context("missing value for --error-rate-duration")?;
                error_rate_duration_secs = value
                    .parse()
                    .context("invalid value for --error-rate-duration")?;
            }
            "--p95-threshold-ms" => {
                i += 1;
                let value = args
                    .get(i)
                    .context("missing value for --p95-threshold-ms")?;
                p95_threshold_ms = value
                    .parse()
                    .context("invalid value for --p95-threshold-ms")?;
            }
            "--p95-duration" => {
                i += 1;
                let value = args.get(i).context("missing value for --p95-duration")?;
                p95_duration_secs = value.parse().context("invalid value for --p95-duration")?;
            }
            "--help" | "-h" => {
                print_help();
                std::process::exit(0);
            }
            other => bail!("unknown argument: {other}"),
        }
        i += 1;
    }

    Ok(Config {
        addr,
        input,
        tcp,
        format,
        top_n,
        workers,
        queue_capacity: (workers.max(1) * 256).max(256),
        drop_strategy,
        sample_n,
        error_rate_threshold,
        error_rate_duration_secs,
        p95_threshold_ms,
        p95_duration_secs,
    })
}

fn print_help() {
    println!(
        "Usage: cargo run -p server -- [--addr 127.0.0.1:3000] [--file path/to/log.jsonl] [--tcp 127.0.0.1:9001] [--format auto|json|access] [--top-n 10] [--workers 4] [--drop-strategy block|drop_newest|drop_oldest|sample_1_in_n]"
    );
    println!("If --file is omitted, the server reads JSON Lines from stdin.");
}

async fn health_handler() -> impl IntoResponse {
    "ok"
}

async fn metrics_handler(State(state): State<AppState>) -> Json<MetricsResponse> {
    let pipeline = state.pipeline.snapshot();
    let snapshot = state.metrics.read().await.snapshot(pipeline);
    Json(snapshot)
}

async fn alerts_handler(State(state): State<AppState>) -> Json<AlertsResponse> {
    Json(AlertsResponse {
        active: state.alerts.read().await.clone(),
    })
}

async fn import_handler(
    State(state): State<AppState>,
    Json(request): Json<ImportRequest>,
) -> impl IntoResponse {
    match analyze_import(&request, state.top_n) {
        Ok(response) => (StatusCode::OK, Json(response)).into_response(),
        Err(error) => (
            StatusCode::BAD_REQUEST,
            Json(ErrorResponse {
                error: error.to_string(),
            }),
        )
            .into_response(),
    }
}

async fn live_ingest_handler(
    State(state): State<AppState>,
    Json(request): Json<LiveIngestRequest>,
) -> impl IntoResponse {
    let mut accepted_lines = 0_u64;

    for line in request.content.lines() {
        let trimmed = line.trim();
        if trimmed.is_empty() {
            continue;
        }

        accepted_lines += 1;
        if let Err(error) = state.ingest.submit(trimmed.to_owned(), accepted_lines).await {
            return (
                StatusCode::BAD_REQUEST,
                Json(ErrorResponse {
                    error: error.to_string(),
                }),
            )
                .into_response();
        }
    }

    (
        StatusCode::OK,
        Json(LiveIngestResponse {
            accepted_lines,
            status: "queued",
        }),
    )
        .into_response()
}

fn analyze_import(request: &ImportRequest, top_n: usize) -> Result<ImportResponse> {
    let parser_kind = parse_format(request.format.as_deref().unwrap_or("auto"))?;
    let mut metrics = MetricsState::new(top_n);
    let mut lines = 0_u64;
    let mut parse_failures = 0_u64;
    let content = request.content.trim();
    let non_empty_lines = request
        .content
        .lines()
        .filter(|line| !line.trim().is_empty())
        .count();

    if !content.is_empty()
        && (non_empty_lines == 1
            || (content.starts_with('{') && !matches!(parser_kind, ParserKind::Access)))
    {
        if let Ok(event) = parse_with_kind(parser_kind, content) {
            metrics.update(&event);
            return Ok(ImportResponse {
                format: format_name(parser_kind).to_string(),
                lines: non_empty_lines as u64,
                metrics: metrics.snapshot(PipelineStats {
                    queue_capacity: 0,
                    queue_len: 0,
                    workers: 1,
                    parse_failures,
                    dropped_lines: 0,
                    drop_rate: 0.0,
                }),
            });
        }
    }

    for line in request.content.lines() {
        let trimmed = line.trim();
        if trimmed.is_empty() {
            continue;
        }

        lines += 1;
        match parse_with_kind(parser_kind, trimmed) {
            Ok(event) => metrics.update(&event),
            Err(ParseError::EmptyLine) => {}
            Err(_) => {
                parse_failures += 1;
                metrics.record_invalid();
            }
        }
    }

    Ok(ImportResponse {
        format: format_name(parser_kind).to_string(),
        lines,
        metrics: metrics.snapshot(PipelineStats {
            queue_capacity: 0,
            queue_len: 0,
            workers: 1,
            parse_failures,
            dropped_lines: 0,
            drop_rate: 0.0,
        }),
    })
}

fn parse_format(value: &str) -> Result<ParserKind> {
    match value {
        "auto" => Ok(ParserKind::Auto),
        "json" => Ok(ParserKind::Json),
        "access" => Ok(ParserKind::Access),
        other => bail!("unsupported format: {other}"),
    }
}

fn format_name(kind: ParserKind) -> &'static str {
    match kind {
        ParserKind::Auto => "auto",
        ParserKind::Json => "json",
        ParserKind::Access => "access",
    }
}

async fn ingest_loop(input: InputSource, ingest: IngestController) -> Result<()> {
    match input {
        InputSource::Stdin => process_reader(io::stdin(), ingest).await?,
        InputSource::File(path) => {
            let file = File::open(&path)
                .await
                .with_context(|| format!("failed to open input file {}", path.display()))?;
            process_reader(file, ingest).await?;
        }
    }
    Ok(())
}

async fn process_reader<R>(reader: R, ingest: IngestController) -> Result<()>
where
    R: AsyncRead + Unpin,
{
    let mut lines = BufReader::new(reader).lines();
    let mut line_no = 0_u64;

    while let Some(line) = lines.next_line().await? {
        line_no += 1;
        ingest.submit(line.trim().to_owned(), line_no).await?;
    }

    Ok(())
}

async fn run_aggregator(receiver: Receiver<ParsedItem>, state: SharedState) {
    while let Ok(item) = receiver.recv().await {
        let mut metrics = state.write().await;
        match item {
            ParsedItem::Event(event) => metrics.update(&event),
            ParsedItem::Invalid => metrics.record_invalid(),
        }
    }
}

async fn run_tcp_ingest(addr: SocketAddr, ingest: IngestController) -> Result<()> {
    let listener = TcpListener::bind(addr)
        .await
        .with_context(|| format!("failed to bind tcp ingest listener at {addr}"))?;

    loop {
        let (stream, _) = listener.accept().await?;
        let ingest = ingest.clone();
        tokio::spawn(async move {
            if let Err(error) = process_tcp_stream(stream, ingest).await {
                eprintln!("tcp client error: {error:#}");
            }
        });
    }
}

async fn process_tcp_stream(stream: TcpStream, ingest: IngestController) -> Result<()> {
    process_reader(stream, ingest).await
}

async fn run_alert_monitor(
    metrics: SharedState,
    pipeline: PipelineStatsHandle,
    alerts: Arc<RwLock<Vec<Alert>>>,
    config: AlertConfig,
) {
    let mut error_rule = RuleState::default();
    let mut p95_rule = RuleState::default();

    loop {
        let now = SystemTime::now();
        let snapshot = {
            let metrics = metrics.read().await;
            metrics.snapshot(pipeline.snapshot())
        };

        let mut next_alerts = Vec::new();
        evaluate_rule(
            &mut error_rule,
            now,
            snapshot
                .windows
                .get("1m")
                .map(|window| window.error_rate)
                .unwrap_or_default(),
            config.error_rate_threshold,
            config.error_rate_duration_secs,
            "error_rate",
            &mut next_alerts,
        );
        evaluate_rule(
            &mut p95_rule,
            now,
            snapshot
                .windows
                .get("1m")
                .map(|window| window.latency_p95_ms as f64)
                .unwrap_or_default(),
            config.p95_threshold_ms as f64,
            config.p95_duration_secs,
            "p95_latency_ms",
            &mut next_alerts,
        );

        *alerts.write().await = next_alerts;
        sleep(Duration::from_secs(1)).await;
    }
}

fn evaluate_rule(
    state: &mut RuleState,
    now: SystemTime,
    current_value: f64,
    threshold: f64,
    sustain_secs: u64,
    name: &str,
    output: &mut Vec<Alert>,
) {
    if current_value > threshold {
        let first_seen = state.first_seen.get_or_insert(now);
        let elapsed = now
            .duration_since(*first_seen)
            .unwrap_or_default()
            .as_secs();
        if elapsed >= sustain_secs {
            output.push(Alert {
                name: name.to_string(),
                start_ts: Some(unix_ts_string(*first_seen)),
                current_value,
                threshold,
                duration_secs: elapsed,
            });
        }
    } else {
        state.first_seen = None;
    }
}

fn unix_ts_string(ts: SystemTime) -> String {
    ts.duration_since(SystemTime::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
        .to_string()
}

#[cfg(test)]
mod tests {
    use super::{ImportRequest, analyze_import};

    #[test]
    fn analyzes_imported_json_lines() {
        let request = ImportRequest {
            format: Some("json".to_string()),
            content: [
                r#"{"timestamp":"2026-04-20T12:00:00Z","path":"/ok","status":200,"latency_ms":20,"method":"GET","service":"gateway"}"#,
                r#"{"timestamp":"2026-04-20T12:00:01Z","path":"/err","status":503,"latency_ms":120,"method":"GET","service":"gateway"}"#,
                r#"{"path":"/broken","status":"oops"}"#,
            ]
            .join("\n"),
        };

        let response = analyze_import(&request, 5).expect("import analysis");
        assert_eq!(response.lines, 3);
        assert_eq!(response.metrics.total, 3);
        assert_eq!(response.metrics.valid, 2);
        assert_eq!(response.metrics.invalid, 1);
        assert_eq!(response.metrics.errors, 1);
        assert_eq!(response.metrics.pipeline.parse_failures, 1);
    }

    #[test]
    fn analyzes_imported_access_lines() {
        let request = ImportRequest {
            format: Some("access".to_string()),
            content: "2026-04-20T12:00:00Z GET /access/orders 201 18 gateway\nbad line".to_string(),
        };

        let response = analyze_import(&request, 5).expect("import analysis");
        assert_eq!(response.format, "access");
        assert_eq!(response.metrics.valid, 1);
        assert_eq!(response.metrics.invalid, 1);
    }

    #[test]
    fn analyzes_pretty_structured_json_as_one_imported_event() {
        let request = ImportRequest {
            format: Some("auto".to_string()),
            content: r#"{
              "functionName": "hello:index",
              "apiContext": {
                "routeKey": "GET /hello",
                "rawPath": "/hello",
                "requestContext": {
                  "http": {
                    "method": "GET",
                    "path": "/hello"
                  }
                }
              },
              "timestamp": "2020-06-21T14:08:33.264Z"
            }"#
            .to_string(),
        };

        let response = analyze_import(&request, 5).expect("import analysis");
        assert_eq!(response.format, "auto");
        assert_eq!(response.metrics.total, 1);
        assert_eq!(response.metrics.valid, 1);
        assert_eq!(response.metrics.top_paths[0].path, "/hello");
    }
}
