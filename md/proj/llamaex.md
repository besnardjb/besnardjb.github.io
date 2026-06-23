# llama-exporter

[github](https://github.com/besnardjb/llama-exporter)

A Prometheus exporter for llama.cpp metrics. It polls a running llama-server instance, accumulates token counts across process restarts, and exposes them as Prometheus metrics plus a web dashboard.

![Sample output of Snapped](md/proj/llama.png)

## What it does

- Polls llama.cpp's `/metrics` endpoint at a configurable interval (default: every 5 seconds).
- Resolves the PID of the llama-server process by reading `/proc/net/tcp` and `/proc/net/tcp6`.
- Accumulates counter deltas across poll cycles, handling PID changes (process restarts).
- Persists state to disk so counters survive exporter restarts.
- Estimates token-based costs using per-model pricing tables (Claude family + local model reference rates).
- Exposes:
  - `/metrics` -- Prometheus text format
  - `/json` -- JSON endpoint for programmatic access
  - `/` -- Web dashboard with token metrics, throughput, cost estimates, and queue status

## Cost estimation

Costs are derived from accumulated token counters multiplied by per-1M-token pricing. Pricing is configurable per model in `src/cost.rs`. Claude models support cache read pricing; other models use fixed reference rates.

## Building

```
cargo build --release
```

## Running

```
llama-exporter [OPTIONS]

Options:
      --port <PORT>                          Port of the llama.cpp metrics endpoint [default: 8080]
      --exporter-port <EXPORTER_PORT>        Port for the /metrics HTTP server [default: 31210]
      --state-dir <STATE_DIR>                Directory for state file
      --poll-interval <POLL_INTERVAL>        Poll interval for llama.cpp in seconds [default: 5]
      --persist-interval <PERSIST_INTERVAL>  Persist interval to disk in seconds [default: 30]
  -h, --help                                 Print help
```

## Configuration

Environment variable `RUST_LOG_DEBUG` controls log verbosity:
- `0` (default): info level
- `1`: info + debug
- `2+`: info + debug + trace

## License

This project is licensed under the [GNU Lesser General Public License v2.1](LICENSE).
See [opensource.org/license/lgpl-2-1](https://opensource.org/license/lgpl-2-1) for details.

