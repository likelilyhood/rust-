use std::{
    env,
    fs::File,
    io::{BufRead, BufReader, BufWriter, Read, Write},
    path::PathBuf,
};

use anyhow::{Context, Result, bail};
use parser::{ParserKind, parse_with_kind};

#[derive(Debug)]
struct Config {
    input: PathBuf,
    output: PathBuf,
    format: ParserKind,
}

fn main() {
    if let Err(error) = run() {
        eprintln!("{error:#}");
        std::process::exit(1);
    }
}

fn run() -> Result<()> {
    let config = parse_args(env::args().skip(1).collect())?;
    let events = normalize(&config)?;
    let output = File::create(&config.output)
        .with_context(|| format!("failed to create {}", config.output.display()))?;
    let mut writer = BufWriter::new(output);

    for event in &events {
        writeln!(writer, "{}", serde_json::to_string(event)?)?;
    }

    writer.flush()?;
    eprintln!(
        "normalized {} events: {} -> {}",
        events.len(),
        config.input.display(),
        config.output.display()
    );
    Ok(())
}

fn parse_args(args: Vec<String>) -> Result<Config> {
    let mut input = None;
    let mut output = None;
    let mut format = ParserKind::Auto;

    let mut index = 0;
    while index < args.len() {
        match args[index].as_str() {
            "--input" => {
                index += 1;
                input = Some(PathBuf::from(
                    args.get(index).context("missing value for --input")?,
                ));
            }
            "--output" => {
                index += 1;
                output = Some(PathBuf::from(
                    args.get(index).context("missing value for --output")?,
                ));
            }
            "--format" => {
                index += 1;
                format = parse_format(args.get(index).context("missing value for --format")?)?;
            }
            "--help" | "-h" => {
                print_help();
                std::process::exit(0);
            }
            other => bail!("unknown argument: {other}"),
        }

        index += 1;
    }

    Ok(Config {
        input: input.context("missing --input")?,
        output: output.context("missing --output")?,
        format,
    })
}

fn normalize(config: &Config) -> Result<Vec<common::LogEvent>> {
    if matches!(config.format, ParserKind::Json) {
        let mut content = String::new();
        File::open(&config.input)
            .with_context(|| format!("failed to open {}", config.input.display()))?
            .read_to_string(&mut content)?;

        if let Ok(event) = parse_with_kind(ParserKind::Json, content.trim()) {
            return Ok(vec![event]);
        }
    }

    let input = File::open(&config.input)
        .with_context(|| format!("failed to open {}", config.input.display()))?;
    let reader = BufReader::new(input);
    let mut events = Vec::new();

    for line in reader.lines() {
        let line = line?;
        let trimmed = line.trim();
        if trimmed.is_empty() || trimmed.starts_with('#') {
            continue;
        }

        if let Ok(event) = parse_with_kind(config.format, trimmed) {
            events.push(event);
        }
    }

    Ok(events)
}

fn parse_format(value: &str) -> Result<ParserKind> {
    match value {
        "auto" => Ok(ParserKind::Auto),
        "json" => Ok(ParserKind::Json),
        "access" => Ok(ParserKind::Access),
        other => bail!("unsupported format: {other}"),
    }
}

fn print_help() {
    println!(
        "Usage: cargo run -p generator --bin normalize_public -- --input cases/public/file.log --output cases/generated/public_normalized.jsonl [--format auto|json|access]"
    );
}
