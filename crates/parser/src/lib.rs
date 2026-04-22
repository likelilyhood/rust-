use common::LogEvent;
use serde_json::Value;
use thiserror::Error;

pub trait LogParser: Send + Sync {
    fn parse_line(&self, line: &str) -> Result<LogEvent, ParseError>;
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ParserKind {
    Auto,
    Json,
    Access,
}

#[derive(Debug, Default)]
pub struct JsonLogParser;

#[derive(Debug, Default)]
pub struct AccessLogParser;

#[derive(Debug, Error)]
pub enum ParseError {
    #[error("empty log line")]
    EmptyLine,
    #[error("invalid json line: {0}")]
    InvalidJson(#[from] serde_json::Error),
    #[error("invalid access log format")]
    InvalidAccessFormat,
    #[error("unsupported structured log format")]
    UnsupportedStructuredLog,
    #[error("invalid status code")]
    InvalidStatus,
    #[error("invalid latency")]
    InvalidLatency,
}

pub fn parse_line(line: &str) -> Result<LogEvent, ParseError> {
    JsonLogParser.parse_line(line)
}

pub fn parse_with_kind(kind: ParserKind, line: &str) -> Result<LogEvent, ParseError> {
    match kind {
        ParserKind::Auto => parse_auto_line(line),
        ParserKind::Json => JsonLogParser.parse_line(line),
        ParserKind::Access => AccessLogParser.parse_line(line),
    }
}

pub fn parse_auto_line(line: &str) -> Result<LogEvent, ParseError> {
    if line.trim().is_empty() {
        return Err(ParseError::EmptyLine);
    }

    if let Ok(event) = JsonLogParser.parse_line(line) {
        return Ok(event);
    }

    AccessLogParser
        .parse_line(line)
        .or_else(|_| parse_elasticsearch_line(line))
}

impl LogParser for JsonLogParser {
    fn parse_line(&self, line: &str) -> Result<LogEvent, ParseError> {
        if line.trim().is_empty() {
            return Err(ParseError::EmptyLine);
        }

        match serde_json::from_str::<LogEvent>(line) {
            Ok(event) => Ok(event),
            Err(log_event_error) => {
                let value: Value = serde_json::from_str(line).map_err(ParseError::InvalidJson)?;
                event_from_structured_json(&value).ok_or_else(|| {
                    if value.is_object() {
                        ParseError::UnsupportedStructuredLog
                    } else {
                        ParseError::InvalidJson(log_event_error)
                    }
                })
            }
        }
    }
}

impl LogParser for AccessLogParser {
    fn parse_line(&self, line: &str) -> Result<LogEvent, ParseError> {
        let trimmed = line.trim();
        if trimmed.is_empty() {
            return Err(ParseError::EmptyLine);
        }

        parse_simple_access(trimmed).or_else(|_| parse_apache_combined(trimmed))
    }
}

fn parse_simple_access(trimmed: &str) -> Result<LogEvent, ParseError> {
    let parts: Vec<&str> = trimmed.split_whitespace().collect();
    if parts.len() < 5 {
        return Err(ParseError::InvalidAccessFormat);
    }

    let status = parts[3].parse().map_err(|_| ParseError::InvalidStatus)?;
    let latency_ms = parts[4].parse().map_err(|_| ParseError::InvalidLatency)?;

    Ok(LogEvent {
        timestamp: Some(parts[0].to_string()),
        method: Some(parts[1].to_string()),
        path: parts[2].to_string(),
        status,
        latency_ms,
        service: parts.get(5).map(|value| (*value).to_string()),
    })
}

fn parse_apache_combined(line: &str) -> Result<LogEvent, ParseError> {
    if line.starts_with('#') {
        return Err(ParseError::InvalidAccessFormat);
    }

    let timestamp = between(line, "[", "]").map(str::to_string);
    let request = between(line, "\"", "\"").ok_or(ParseError::InvalidAccessFormat)?;
    let after_request = line
        .split_once(&format!("\"{request}\""))
        .map(|(_, right)| right.trim())
        .ok_or(ParseError::InvalidAccessFormat)?;
    let mut tail_parts = after_request.split_whitespace();
    let status = tail_parts
        .next()
        .ok_or(ParseError::InvalidStatus)?
        .parse()
        .map_err(|_| ParseError::InvalidStatus)?;
    let bytes = tail_parts
        .next()
        .and_then(|value| value.parse::<u64>().ok())
        .unwrap_or(0);

    let mut request_parts = request.split_whitespace();
    let method = request_parts.next().filter(|value| *value != "-");
    let path = request_parts
        .next()
        .filter(|value| *value != "-")
        .unwrap_or("/");

    Ok(LogEvent {
        timestamp,
        method: method.map(str::to_string),
        path: path.to_string(),
        status,
        latency_ms: synthetic_latency_from_size(bytes),
        service: Some("apache".to_string()),
    })
}

fn event_from_structured_json(value: &Value) -> Option<LogEvent> {
    let object = value.as_object()?;

    if object.contains_key("apiContext") || object.contains_key("awsContext") {
        return Some(LogEvent {
            timestamp: string_at(value, &["timestamp"])
                .or_else(|| string_at(value, &["apiContext", "requestContext", "time"])),
            method: string_at(value, &["apiContext", "requestContext", "http", "method"]).or_else(
                || method_from_route(string_at(value, &["apiContext", "routeKey"]).as_deref()),
            ),
            path: string_at(value, &["apiContext", "rawPath"])
                .or_else(|| string_at(value, &["apiContext", "requestContext", "http", "path"]))
                .or_else(|| {
                    path_from_route(string_at(value, &["apiContext", "routeKey"]).as_deref())
                })
                .unwrap_or_else(|| "/lambda".to_string()),
            status: number_at(value, &["statusCode"])
                .or_else(|| number_at(value, &["response", "statusCode"]))
                .unwrap_or(200) as u16,
            latency_ms: number_at(value, &["latency_ms"])
                .or_else(|| number_at(value, &["duration_ms"]))
                .or_else(|| {
                    number_at(value, &["apiContext", "headers", "content-length"])
                        .map(synthetic_latency_from_size)
                })
                .unwrap_or(50),
            service: string_at(value, &["functionName"])
                .or_else(|| string_at(value, &["awsContext", "functionName"]))
                .or_else(|| Some("lambda".to_string())),
        });
    }

    let path = string_at(value, &["path"])
        .or_else(|| string_at(value, &["url"]))
        .or_else(|| string_at(value, &["uri"]))
        .or_else(|| string_at(value, &["request", "path"]))
        .or_else(|| string_at(value, &["http", "path"]))?;
    let status = match number_at(value, &["status"])
        .or_else(|| number_at(value, &["status_code"]))
        .or_else(|| number_at(value, &["http", "status_code"]))
    {
        Some(status) => status as u16,
        None if exists_at(value, &["status"])
            || exists_at(value, &["status_code"])
            || exists_at(value, &["http", "status_code"]) =>
        {
            return None;
        }
        None => 200,
    };
    let latency_ms = match number_at(value, &["latency_ms"])
        .or_else(|| number_at(value, &["duration_ms"]))
        .or_else(|| number_at(value, &["elapsed_ms"]))
    {
        Some(latency_ms) => latency_ms,
        None if exists_at(value, &["latency_ms"])
            || exists_at(value, &["duration_ms"])
            || exists_at(value, &["elapsed_ms"]) =>
        {
            return None;
        }
        None => 50,
    };

    Some(LogEvent {
        timestamp: string_at(value, &["timestamp"]).or_else(|| string_at(value, &["@timestamp"])),
        method: string_at(value, &["method"])
            .or_else(|| string_at(value, &["http", "method"]))
            .or_else(|| string_at(value, &["request", "method"])),
        path,
        status,
        latency_ms,
        service: string_at(value, &["service"])
            .or_else(|| string_at(value, &["service", "name"]))
            .or_else(|| Some("json".to_string())),
    })
}

fn parse_elasticsearch_line(line: &str) -> Result<LogEvent, ParseError> {
    if !line.starts_with('[') {
        return Err(ParseError::InvalidAccessFormat);
    }

    let mut parts = line.split(']');
    let timestamp = parts
        .next()
        .and_then(|value| value.strip_prefix('['))
        .ok_or(ParseError::InvalidAccessFormat)?;
    let level = parts
        .next()
        .and_then(|value| value.strip_prefix('['))
        .unwrap_or("INFO")
        .trim();
    let component = parts
        .next()
        .and_then(|value| value.strip_prefix('['))
        .unwrap_or("elasticsearch")
        .trim();
    let message_len = line.len() as u64;

    let status = match level {
        "ERROR" | "FATAL" => 500,
        "WARN" => 429,
        "DEBUG" | "TRACE" => 204,
        _ => 200,
    };

    Ok(LogEvent {
        timestamp: Some(timestamp.replace(',', ".")),
        method: Some(level.to_string()),
        path: format!("/elasticsearch/{}", component.replace('.', "/")),
        status,
        latency_ms: synthetic_latency_from_size(message_len),
        service: Some("elasticsearch".to_string()),
    })
}

fn between<'a>(value: &'a str, left: &str, right: &str) -> Option<&'a str> {
    let (_, after_left) = value.split_once(left)?;
    let (inside, _) = after_left.split_once(right)?;
    Some(inside)
}

fn string_at(value: &Value, path: &[&str]) -> Option<String> {
    let mut current = value;
    for segment in path {
        current = current.get(*segment)?;
    }

    current
        .as_str()
        .map(str::to_string)
        .or_else(|| current.as_u64().map(|number| number.to_string()))
}

fn number_at(value: &Value, path: &[&str]) -> Option<u64> {
    let mut current = value;
    for segment in path {
        current = current.get(*segment)?;
    }

    current
        .as_u64()
        .or_else(|| current.as_str().and_then(|text| text.parse().ok()))
}

fn exists_at(value: &Value, path: &[&str]) -> bool {
    let mut current = value;
    for segment in path {
        match current.get(*segment) {
            Some(next) => current = next,
            None => return false,
        }
    }

    true
}

fn method_from_route(route: Option<&str>) -> Option<String> {
    route?.split_whitespace().next().map(str::to_string)
}

fn path_from_route(route: Option<&str>) -> Option<String> {
    route?.split_whitespace().nth(1).map(str::to_string)
}

fn synthetic_latency_from_size(size: u64) -> u64 {
    (size / 100).clamp(1, 5_000)
}

#[cfg(test)]
mod tests {
    use super::{
        AccessLogParser, JsonLogParser, LogParser, ParserKind, parse_line, parse_with_kind,
    };

    #[test]
    fn parses_valid_json_line() {
        let line = r#"{"timestamp":"2026-04-20T12:00:00Z","path":"/api/orders","status":200,"latency_ms":41,"method":"GET","service":"gateway"}"#;
        let event = parse_line(line).expect("valid event");

        assert_eq!(event.path, "/api/orders");
        assert_eq!(event.status, 200);
        assert_eq!(event.latency_ms, 41);
    }

    #[test]
    fn parses_access_log_line() {
        let line = "2026-04-20T12:00:00Z GET /access/orders 201 18 gateway";
        let event = AccessLogParser.parse_line(line).expect("valid access log");

        assert_eq!(event.path, "/access/orders");
        assert_eq!(event.status, 201);
        assert_eq!(event.latency_ms, 18);
        assert_eq!(event.method.as_deref(), Some("GET"));
        assert_eq!(event.service.as_deref(), Some("gateway"));
    }

    #[test]
    fn parses_with_kind_dispatch() {
        let line = "2026-04-20T12:00:00Z POST /dispatch 204 9 edge";
        let event = parse_with_kind(ParserKind::Access, line).expect("dispatched parser");
        assert_eq!(event.status, 204);
    }

    #[test]
    fn parses_apache_combined_line() {
        let line = r#"10.130.77.149 - - [12/Mar/2012:22:48:03 -0500] "GET /MyApp/ HTTP/1.1" 200 4436 "-" "-""#;
        let event = parse_with_kind(ParserKind::Access, line).expect("apache line");
        assert_eq!(event.path, "/MyApp/");
        assert_eq!(event.status, 200);
        assert_eq!(event.method.as_deref(), Some("GET"));
        assert_eq!(event.service.as_deref(), Some("apache"));
    }

    #[test]
    fn parses_lambda_structured_json() {
        let line = r#"{"functionName":"helloworld:index","apiContext":{"routeKey":"GET /helloworld","rawPath":"/helloworld","requestContext":{"http":{"method":"GET","path":"/helloworld"}}},"timestamp":"2020-06-21T14:08:33.264Z"}"#;
        let event = parse_with_kind(ParserKind::Json, line).expect("lambda json");
        assert_eq!(event.path, "/helloworld");
        assert_eq!(event.status, 200);
        assert_eq!(event.service.as_deref(), Some("helloworld:index"));
    }

    #[test]
    fn parses_elasticsearch_line_in_auto_mode() {
        let line = "[2019-05-09T00:23:59,217][WARN ][r.suppressed] [hostname.changed.com] path: /.kibana_task_manager/_search";
        let event = parse_with_kind(ParserKind::Auto, line).expect("elasticsearch line");
        assert_eq!(event.status, 429);
        assert_eq!(event.service.as_deref(), Some("elasticsearch"));
        assert!(event.path.starts_with("/elasticsearch/"));
    }

    #[test]
    fn rejects_invalid_json_line() {
        let line = r#"{"path":"/broken","status":"oops"}"#;
        assert!(JsonLogParser.parse_line(line).is_err());
    }

    #[test]
    fn rejects_empty_line() {
        assert!(parse_line("   ").is_err());
    }

    #[test]
    fn rejects_short_access_line() {
        assert!(AccessLogParser.parse_line("GET /broken").is_err());
    }
}
