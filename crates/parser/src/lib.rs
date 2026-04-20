use common::LogEvent;
use thiserror::Error;

pub trait LogParser: Send + Sync {
    fn parse_line(&self, line: &str) -> Result<LogEvent, ParseError>;
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ParserKind {
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
        ParserKind::Json => JsonLogParser.parse_line(line),
        ParserKind::Access => AccessLogParser.parse_line(line),
    }
}

impl LogParser for JsonLogParser {
    fn parse_line(&self, line: &str) -> Result<LogEvent, ParseError> {
        if line.trim().is_empty() {
            return Err(ParseError::EmptyLine);
        }

        Ok(serde_json::from_str(line)?)
    }
}

impl LogParser for AccessLogParser {
    fn parse_line(&self, line: &str) -> Result<LogEvent, ParseError> {
        let trimmed = line.trim();
        if trimmed.is_empty() {
            return Err(ParseError::EmptyLine);
        }

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
