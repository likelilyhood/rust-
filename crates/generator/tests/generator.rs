use std::{
    io::{BufRead, BufReader},
    net::TcpListener,
    process::Command,
    thread,
};

use common::LogEvent;
use generator::{Config, Mode, generate_batch, pacing_for};

#[test]
fn generates_mode_specific_payloads() {
    let normal = generate_batch(&Config {
        mode: Mode::Normal,
        count: 8,
        interval_ms: 0,
        push: None,
    });
    assert!(normal.iter().all(|event| event.status == 200));
    assert!(normal.iter().all(|event| event.latency_ms < 100));

    let errors = generate_batch(&Config {
        mode: Mode::SpikeError,
        count: 12,
        interval_ms: 0,
        push: None,
    });
    assert!(errors.iter().any(|event| event.status >= 500));

    let latency = generate_batch(&Config {
        mode: Mode::SpikeLatency,
        count: 12,
        interval_ms: 0,
        push: None,
    });
    assert!(latency.iter().any(|event| event.latency_ms >= 2_000));

    let wave_pacing = [
        pacing_for(0, Mode::WaveQps, 5),
        pacing_for(3, Mode::WaveQps, 5),
        pacing_for(7, Mode::WaveQps, 5),
    ];
    assert!(wave_pacing[0] < wave_pacing[1]);
    assert!(wave_pacing[1] > wave_pacing[2]);
}

#[test]
fn emits_jsonl_to_stdout_and_tcp() {
    let listener = TcpListener::bind("127.0.0.1:0").expect("bind listener");
    let addr = listener.local_addr().expect("listener addr");

    let tcp_reader = thread::spawn(move || {
        let (stream, _) = listener.accept().expect("accept tcp connection");
        let mut reader = BufReader::new(stream);
        let mut lines = Vec::new();
        let mut line = String::new();

        while reader.read_line(&mut line).expect("read tcp line") > 0 {
            lines.push(line.trim_end().to_owned());
            line.clear();
        }

        lines
    });

    let output = Command::new(env!("CARGO_BIN_EXE_generator"))
        .args([
            "--mode",
            "normal",
            "--count",
            "4",
            "--interval-ms",
            "0",
            "--push",
        ])
        .arg(addr.to_string())
        .output()
        .expect("run generator");

    assert!(
        output.status.success(),
        "stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );

    let stdout = String::from_utf8(output.stdout).expect("stdout utf8");
    let stdout_lines: Vec<String> = stdout.lines().map(ToOwned::to_owned).collect();
    assert_eq!(stdout_lines.len(), 4);

    let tcp_lines = tcp_reader.join().expect("join tcp reader");
    assert_eq!(tcp_lines, stdout_lines);

    for line in stdout_lines {
        let event: LogEvent = serde_json::from_str(&line).expect("valid json event");
        assert_eq!(event.status, 200);
        assert_eq!(event.service.as_deref(), Some("gateway"));
    }
}
