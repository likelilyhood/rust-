use std::env;

use anyhow::{Context, Result};
use generator::{Config, Mode};

fn main() {
    if let Err(error) = run() {
        eprintln!("{error:#}");
        std::process::exit(1);
    }
}

fn run() -> Result<()> {
    let config = parse_args(env::args().skip(1).collect())?;
    generator::run(&config)
}

fn parse_args(args: Vec<String>) -> Result<Config> {
    let mut mode = Mode::Normal;
    let mut count = 32_usize;
    let mut interval_ms = 5_u64;
    let mut push = None;

    let mut index = 0;
    while index < args.len() {
        match args[index].as_str() {
            "--mode" => {
                index += 1;
                let value = args.get(index).context("missing value for --mode")?;
                mode = Mode::parse(value)?;
            }
            "--count" => {
                index += 1;
                let value = args.get(index).context("missing value for --count")?;
                count = value.parse().context("invalid value for --count")?;
            }
            "--interval-ms" => {
                index += 1;
                let value = args.get(index).context("missing value for --interval-ms")?;
                interval_ms = value.parse().context("invalid value for --interval-ms")?;
            }
            "--push" => {
                index += 1;
                let value = args.get(index).context("missing value for --push")?;
                push = Some(value.parse().context("invalid value for --push")?);
            }
            "--help" | "-h" => {
                print_help();
                std::process::exit(0);
            }
            other => return Err(anyhow::anyhow!("unknown argument: {other}")),
        }

        index += 1;
    }

    Ok(Config {
        mode,
        count,
        interval_ms,
        push,
    })
}

fn print_help() {
    println!(
        "Usage: cargo run -p generator -- [--mode normal|spike_error|spike_latency|wave_qps] [--count N] [--interval-ms N] [--push HOST:PORT]"
    );
}
