use std::{
    io::{self, BufWriter, Write},
    net::{SocketAddr, TcpStream},
    time::Duration,
};

use anyhow::{Context, Result};
use common::LogEvent;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Mode {
    Normal,
    SpikeError,
    SpikeLatency,
    WaveQps,
}

impl Mode {
    pub fn parse(value: &str) -> Result<Self> {
        match value {
            "normal" => Ok(Self::Normal),
            "spike_error" => Ok(Self::SpikeError),
            "spike_latency" => Ok(Self::SpikeLatency),
            "wave_qps" => Ok(Self::WaveQps),
            other => Err(anyhow::anyhow!("unknown mode: {other}")),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Config {
    pub mode: Mode,
    pub count: usize,
    pub interval_ms: u64,
    pub push: Option<SocketAddr>,
}

pub fn generate_batch(config: &Config) -> Vec<LogEvent> {
    (0..config.count)
        .map(|index| generate_event(index, config))
        .collect()
}

pub fn generate_event(index: usize, config: &Config) -> LogEvent {
    let timestamp = Some(format!(
        "2026-04-20T12:{:02}:{:02}Z",
        (index / 60) % 60,
        index % 60
    ));

    let mut status = 200;
    let mut latency_ms = 40 + (index as u64 % 12);

    match config.mode {
        Mode::Normal => {}
        Mode::SpikeError => {
            let burst_start = config.count / 3;
            let burst_len = (config.count / 5).max(2);
            if index >= burst_start && index < burst_start + burst_len {
                status = 500;
                latency_ms = 280 + (index as u64 % 25);
            }
        }
        Mode::SpikeLatency => {
            let burst_start = config.count / 2;
            let burst_len = (config.count / 5).max(2);
            if index >= burst_start && index < burst_start + burst_len {
                latency_ms = 2_000 + (index as u64 % 250);
            }
        }
        Mode::WaveQps => {}
    }

    LogEvent {
        timestamp,
        path: if index.is_multiple_of(2) {
            "/api/orders".to_string()
        } else {
            "/api/users".to_string()
        },
        status,
        latency_ms,
        method: Some("GET".to_string()),
        service: Some("gateway".to_string()),
    }
}

pub fn pacing_for(index: usize, mode: Mode, interval_ms: u64) -> Duration {
    let factor = match mode {
        Mode::WaveQps => match index % 8 {
            0 | 1 | 7 => 1,
            2 | 6 => 2,
            3 | 5 => 3,
            _ => 4,
        },
        _ => 1,
    };

    Duration::from_millis(interval_ms.saturating_mul(factor))
}

pub fn run(config: &Config) -> Result<()> {
    let stdout = io::stdout();
    let mut stdout = BufWriter::new(stdout.lock());
    let mut push_writer = match config.push {
        Some(addr) => Some(BufWriter::new(
            TcpStream::connect(addr).with_context(|| format!("failed to connect to {addr}"))?,
        )),
        None => None,
    };

    for index in 0..config.count {
        let event = generate_event(index, config);
        let line = serde_json::to_string(&event)?;
        writeln!(stdout, "{line}")?;

        if let Some(writer) = push_writer.as_mut() {
            writeln!(writer, "{line}")?;
        }

        if index + 1 < config.count {
            std::thread::sleep(pacing_for(index, config.mode, config.interval_ms));
        }
    }

    stdout.flush()?;
    if let Some(writer) = push_writer.as_mut() {
        writer.flush()?;
    }

    Ok(())
}
