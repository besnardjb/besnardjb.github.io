# promgw — Prometheus Query Gateway

`promgw` is a lightweight Prometheus query gateway that periodically fetches Prometheus queries, caches the results in memory, and exposes them via a simple HTTP API. It is designed for scenarios where a Prometheus instance is behind a firewall or NAT and needs to be proxied behind a static, easy-to-consume HTTP API without taking the risk of fully exposing the full Prometheus instance. Queries are fixed and predefined and cannot be changed at runtime.

[github](https://github.com/besnardjb/promgw)

## Architecture

```
┌──────────┐     ┌──────────────┐     ┌──────────┐
│  config. │────▶│ Cache::new() │────▶│  Cache   │
│  yaml    │     │              │     │  (DashMap)│
└──────────┘     └──────────────┘     └──────────┘
                                                 │
 ┌──────────────────────────────────────────────┼──────────────────┐
 │                                              ▼                  │
 │  ┌──────────────┐    spawn_fetch_loop()  ┌──────────────┐   │
 │  │  axum Router │◀───────────────────────│  Cache Entry  │   │
 │  │              │   background task      │  (per query)  │   │
 │  └──────────────┘                        └──────────────┘   │
 │       ▲                                                         │
 │       └── HTTP GET /{query_name} ──────────────────────────────┘
 │
 │  ┌──────────────────────────────────────────┐
 │  │  Prometheus API                            │
 │  │  /api/v1/query          (instant queries)  │
 │  │  /api/v1/query_range      (range queries)  │
 │  └──────────────────────────────────────────┘
```

## Quick Start

```bash
# Build
cargo build --release

# Run with default config (reads config.yaml in current directory)
./target/release/promgw

# Run with a custom config path
./target/release/promgw /etc/promgw/config.yaml

# Enable the /all bulk endpoint
./target/release/promgw --all

# Show help
./target/release/promgw --help
```

### Server Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check — `{"status":"ok"}` or `{"status":"degraded"}` |
| `/all` | GET | Return all cached query results as a JSON object (requires `--all` flag) |
| `/{query_name}` | GET | Return a single cached query result by endpoint path |

### Example Requests

```bash
# Health check
curl http://localhost:9091/health
# → {"status":"ok"}

# All cached results
curl http://localhost:9091/all
# → {"query_a": {...}, "query_b": {...}}

# Single query
curl http://localhost:9091/imeon_em_power
# → {"query":"imeon_em_power","last_scrape":1700000000,"type":"vector","s":[...]}

# Unknown endpoint
curl http://localhost:9091/unknown
# → 404 {"error":"unknown endpoint","path":"unknown","known_endpoints":["/foo","/bar"]}
```

## Configuration

`promgw` loads its configuration from a YAML file. The path is specified via the CLI argument (defaults to `config.yaml` in the current working directory).

### Full Configuration Schema

```yaml
# Required: Prometheus API base URL (must include scheme)
prometheus_url: http://prometheus:9090

# Optional: How often to re-fetch all queries (Go-style duration).
# Default: 10s
scrape_interval: 10s

# Optional: HTTP timeout per Prometheus request (Go-style duration).
# Default: 5s
timeout: 5s

# Optional: Named query definitions
queries:
  <query_name>:
    expr: <promql_expression>           # Required: PromQL expression
    type: instant | range               # Required: query type
    endpoint: /<path>                   # Required: HTTP endpoint path
    start: <time_arg>                   # Optional: range query start
    end: <time_arg>                     # Optional: range query end
    step: <duration>                    # Optional: resolution step (range only)
```

### Top-Level Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `prometheus_url` | `string` | Yes | — | Base URL of the Prometheus instance (must include scheme, e.g. `http://` or `https://`) |
| `scrape_interval` | `duration` | No | `10s` | How often the background fetch loop re-fetches all queries |
| `timeout` | `duration` | No | `5s` | HTTP timeout for each Prometheus API request |
| `queries` | `map<string, QueryDef>` | No | `{}` | Named query definitions, keyed by query name |

### Duration Format

Durations use **Go-style suffixes**. Multiple segments can be concatenated.

| Suffix | Meaning | Example | Seconds |
|--------|---------|---------|---------|
| `ms` | Milliseconds | `500ms` | 0.5 |
| `s` | Seconds | `10s` | 10 |
| `m` | Minutes | `5m` | 300 |
| `h` | Hours | `1h` | 3600 |
| `d` | Days | `1d` | 86400 |

**Valid duration examples:**

```yaml
scrape_interval: 10s        # 10 seconds
scrape_interval: 1m         # 1 minute
scrape_interval: 1h         # 1 hour
scrape_interval: 1h30m      # 1 hour 30 minutes (5400 seconds)
scrape_interval: 2d         # 2 days
scrape_interval: 500ms      # 500 milliseconds
```

### Time Arguments (`start`, `end`)

Time arguments support two formats:

| Format | Example | Description |
|--------|---------|-------------|
| **Duration** | `-24h` | Go-style duration, subtracted from current time |
| **Timestamp** | `now` | Literal string — resolved to current time |
| **Timestamp** | `2024-01-01T00:00:00Z` | ISO 8601 datetime |
| **Timestamp** | `1700000000` | Epoch seconds (integer) |
| **Timestamp** | `1700000000.5` | Epoch seconds (float) |

### Query Types

| Type | Description | Fields Used |
|------|-------------|-------------|
| `instant` | Returns a snapshot at the current time | `expr`, `endpoint` |
| `range` | Returns a time series over a specified window | `expr`, `endpoint`, `start`, `end`, `step` |

---

## Configuration Examples

### Example 1 — Minimal Configuration

A minimal config with a single instant query:

```yaml
prometheus_url: http://prometheus:9090

queries:
  up:
    expr: up
    type: instant
    endpoint: /up
```

```bash
curl http://localhost:9091/up
# Returns instant vector of up/down status for all targets
```

### Example 2 — Node Exporter Dashboards

Monitor node exporter metrics with both instant and range queries:

```yaml
prometheus_url: http://prometheus:9090
scrape_interval: 30s

queries:
  # Current CPU usage across all cores (instant)
  cpu_usage:
    expr: 100 - avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100
    type: instant
    endpoint: /cpu_usage

  # Memory usage snapshot (instant)
  memory_usage:
    expr: 100 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) * 100
    type: instant
    endpoint: /memory_usage

  # CPU usage over time (range — last 1 hour)
  cpu_history:
    expr: 100 - avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100
    type: range
    endpoint: /cpu_history
    start: -1h
    end: now
    step: 15s

  # Disk I/O over time (range — last 6 hours)
  disk_io:
    expr: rate(node_disk_io_time_seconds_total[5m])
    type: range
    endpoint: /disk_io
    start: -6h
    end: now
    step: 30s

  # Network traffic (range — last 24 hours)
  network_traffic:
    expr: rate(node_network_receive_bytes_total[5m])
    type: range
    endpoint: /network_traffic
    start: -24h
    end: now
    step: 60s
```

### Example 3 — Application Metrics with Custom Time Ranges

Monitor application-specific metrics with varied time windows:

```yaml
prometheus_url: http://prometheus:9090
scrape_interval: 15s
timeout: 10s

queries:
  # Request rate (instant)
  http_requests_total:
    expr: sum(rate(http_requests_total[5m])) by (service)
    type: instant
    endpoint: /http_requests_total

  # Error rate over last hour (range)
  error_rate:
    expr: sum(rate(http_requests_total{status=~"5.."}[5m])) by (service) / sum(rate(http_requests_total[5m])) by (service)
    type: range
    endpoint: /error_rate
    start: -1h
    end: now
    step: 10s

  # Latency p99 over last 2 hours (range)
  latency_p99:
    expr: histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, service))
    type: range
    endpoint: /latency_p99
    start: -2h
    end: now
    step: 15s

  # Uptime counter (instant)
  uptime:
    expr: time() - process_start_time_seconds
    type: instant
    endpoint: /uptime

  # Garbage collection metrics (range — last 30 minutes)
  gc_metrics:
    expr: rate(go_gc_duration_seconds_sum[5m])
    type: range
    endpoint: /gc_metrics
    start: -30m
    end: now
    step: 5s
```

### Example 4 — Multiple Prometheus Instances (Single Target)

```yaml
prometheus_url: http://prometheus-prod:9090
scrape_interval: 20s

queries:
  # Service health check
  service_health:
    expr: probe_success{job="blackbox"}
    type: instant
    endpoint: /health_check

  # SSL certificate expiry (range — last 7 days)
  ssl_expiry:
    expr: probe_ssl_earliest_cert_expiry - time()
    type: range
    endpoint: /ssl_expiry
    start: -7d
    end: now
    step: 3600

  # Pod restart count (range — last 3 days)
  pod_restarts:
    expr: increase(kube_pod_container_status_restarts_total[1d])
    type: range
    endpoint: /pod_restarts
    start: -3d
    end: now
    step: 900
```

### Example 5 — All Duration Formats

```yaml
prometheus_url: http://prometheus:9090

# Very fast scrape for real-time dashboards
scrape_interval: 5s

queries:
  # Instant query — no time range needed
  node_load:
    expr: node_load1
    type: instant
    endpoint: /node_load

  # Range query with minute-level step
  disk_usage_history:
    expr: node_filesystem_avail_bytes
    type: range
    endpoint: /disk_usage_history
    start: -2h
    end: now
    step: 60s

  # Range query with hour-level step for long windows
  monthly_trend:
    expr: avg(node_memory_MemFree_bytes)
    type: range
    endpoint: /monthly_trend
    start: -30d
    end: now
    step: 3600s

  # Range query with day-level step for very long windows
  yearly_trend:
    expr: avg(rate(node_cpu_seconds_total[1m]))
    type: range
    endpoint: /yearly_trend
    start: -365d
    end: now
    step: 86400s
```

### Example 6 — Complex PromQL Expressions

```yaml
prometheus_url: http://prometheus:9090
scrape_interval: 10s

queries:
  # Histogram quantile — p99 latency
  p99_latency:
    expr: histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, job))
    type: instant
    endpoint: /p99_latency

  # Top 10 consumers by CPU
  top_cpu_consumers:
    expr: topk(10, rate(node_cpu_seconds_total{mode!="idle"}[5m]))
    type: instant
    endpoint: /top_cpu_consumers

  # Alert firing rate (range)
  alert_rate:
    expr: increase(ALERTS{alertstate="firing"}[1h])
    type: range
    endpoint: /alert_rate
    start: -6h
    end: now
    step: 60s

  # Recording rule evaluation
  recording_rule:
    expr: job:node_memory_MemAvailable_bytes:ratio
    type: instant
    endpoint: /recording_rule

  # Vector math
  memory_ratio:
    expr: node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes
    type: instant
    endpoint: /memory_ratio

  # Aggregation with by clause
  avg_by_job:
    expr: avg(rate(container_cpu_usage_seconds_total[5m])) by (job)
    type: instant
    endpoint: /avg_by_job

  # Subtraction of two metrics
  net_bytes:
    expr: (rate(node_network_receive_bytes_total[5m]) - rate(node_network_transmit_bytes_total[5m]))
    type: instant
    endpoint: /net_bytes

  # Rate over time with custom step
  throughput_history:
    expr: rate(http_requests_total[1m])
    type: range
    endpoint: /throughput_history
    start: -4h
    end: now
    step: 30s

  # Increase counter over time
  error_count:
    expr: increase(http_requests_total{code=~"5.."}[10m])
    type: range
    endpoint: /error_count
    start: -2h
    end: now
    step: 10s

  # Histogram quantile with custom step
  p95_latency_history:
    expr: histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, job))
    type: range
    endpoint: /p95_latency_history
    start: -3h
    end: now
    step: 20s
```

### Example 7 — TLS / Auth Config

```yaml
prometheus_url: https://prometheus.example.com:9090
scrape_interval: 30s
timeout: 15s

queries:
  secure_query:
    expr: up
    type: instant
    endpoint: /secure
```

### Example 8 — Empty Queries (No Queries Configured)

```yaml
prometheus_url: http://prometheus:9090
scrape_interval: 10s
queries: {}
```

### Example 9 — All Time Argument Formats

```yaml
prometheus_url: http://prometheus:9090

queries:
  # Duration-based start
  relative_start:
    expr: up
    type: range
    endpoint: /relative_start
    start: -24h
    end: now

  # "now" as end
  now_end:
    expr: up
    type: range
    endpoint: /now_end
    start: -1h
    end: now

  # ISO 8601 timestamps
  iso_timestamps:
    expr: up
    type: range
    endpoint: /iso_timestamps
    start: "2024-01-01T00:00:00Z"
    end: "2024-01-02T00:00:00Z"

  # Epoch timestamps
  epoch_timestamps:
    expr: up
    type: range
    endpoint: /epoch_timestamps
    start: 1704067200
    end: 1704153600

  # Mixed: duration start, epoch end
  mixed_timestamps:
    expr: up
    type: range
    endpoint: /mixed_timestamps
    start: -1h
    end: 1704153600

  # No start/end — Prometheus uses defaults
  auto_time_range:
    expr: up
    type: range
    endpoint: /auto_time_range
    step: 15s
```

### Example 10 — Production-Ready Full Config

```yaml
prometheus_url: http://prometheus.internal:9090
scrape_interval: 15s
timeout: 10s

queries:
  # === Infrastructure Health ===
  node_up:
    expr: up
    type: instant
    endpoint: /node_up

  node_cpu_load:
    expr: node_load1
    type: instant
    endpoint: /node_cpu_load

  node_memory_available:
    expr: node_memory_MemAvailable_bytes
    type: instant
    endpoint: /node_memory_available

  # === Infrastructure History ===
  cpu_history:
    expr: avg(rate(node_cpu_seconds_total{mode!="idle"}[5m])) by (instance)
    type: range
    endpoint: /cpu_history
    start: -6h
    end: now
    step: 30s

  memory_history:
    expr: node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes
    type: range
    endpoint: /memory_history
    start: -6h
    end: now
    step: 60s

  disk_history:
    expr: node_filesystem_avail_bytes{fstype!="tmpfs"} / node_filesystem_size_bytes{fstype!="tmpfs"}
    type: range
    endpoint: /disk_history
    start: -24h
    end: now
    step: 300

  # === Application Metrics ===
  request_rate:
    expr: sum(rate(http_requests_total[5m])) by (service)
    type: instant
    endpoint: /request_rate

  error_rate:
    expr: sum(rate(http_requests_total{code=~"5.."}[5m])) by (service)
    type: instant
    endpoint: /error_rate

  latency_p99:
    expr: histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, service))
    type: instant
    endpoint: /latency_p99

  # === Application History ===
  request_rate_history:
    expr: sum(rate(http_requests_total[5m])) by (service)
    type: range
    endpoint: /request_rate_history
    start: -1h
    end: now
    step: 10s

  error_rate_history:
    expr: sum(rate(http_requests_total{code=~"5.."}[5m])) by (service)
    type: range
    endpoint: /error_rate_history
    start: -1h
    end: now
    step: 10s

  latency_p99_history:
    expr: histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, service))
    type: range
    endpoint: /latency_p99_history
    start: -1h
    end: now
    step: 10s

  # === Kubernetes Metrics ===
  pod_restarts:
    expr: kube_pod_container_status_restarts_total
    type: instant
    endpoint: /pod_restarts

  pod_restarts_history:
    expr: increase(kube_pod_container_status_restarts_total[1h])
    type: range
    endpoint: /pod_restarts_history
    start: -6h
    end: now
    step: 300

  # === Custom Business Metrics ===
  active_users:
    expr: sum(active_users_total)
    type: instant
    endpoint: /active_users

  revenue_rate:
    expr: rate(transaction_amount_total[5m])
    type: instant
    endpoint: /revenue_rate

  revenue_history:
    expr: sum(rate(transaction_amount_total[5m])) by (product_category)
    type: range
    endpoint: /revenue_history
    start: -24h
    end: now
    step: 60s
```

## Response Format

All responses use a compact JSON format. The `types` module defines the wire format:

### Scalar Response
```json
{
  "query": "my_query",
  "last_scrape": 1700000000,
  "type": "scalar",
  "v": 42.5,
  "ts": 1700000000
}
```

### Vector Response
```json
{
  "query": "my_query",
  "last_scrape": 1700000000,
  "type": "vector",
  "s": [
    { "n": "http_requests_total", "l": {"method": "GET"}, "v": 42.0, "ts": 1700000000 }
  ]
}
```

### Matrix (Range) Response
```json
{
  "query": "my_query",
  "last_scrape": 1700000000,
  "type": "matrix",
  "s": [
    {
      "n": "http_requests_total",
      "l": {"method": "GET"},
      "p": [
        { "ts": 1700000000, "v": 10.0 },
        { "ts": 1700000015, "v": 20.0 }
      ]
    }
  ]
}
```

### Error Response
```json
{
  "query": "my_query",
  "last_scrape": 1700000000,
  "type": "error",
  "e": "parse error at :1:3: ..."
}
```

### Field Reference

| Field | Description |
|-------|-------------|
| `query` | Query name as defined in `config.yaml` |
| `last_scrape` | Unix timestamp of the cache fetch (UTC seconds) |
| `type` | Result type: `scalar`, `vector`, `matrix`, or `error` |
| `v` | Numeric value (scalar sample or vector sample value) |
| `ts` | Timestamp (UTC seconds) |
| `n` | Series name |
| `l` | Label set (key→value map) |
| `s` | Series array (vector) or series array (matrix) |
| `p` | Points array (matrix only) |
| `e` | Error message |

## CLI Usage

```bash
promgw [OPTIONS] [CONFIG_PATH]

Arguments:
  [CONFIG_PATH]  Path to the YAML configuration file [default: config.yaml]

Options:
  --all            Enable the /all bulk endpoint (required to access /all)
  -h, --help       Print help
  -V, --version    Print version
```

```bash
# Default config path
promgw

# Custom config path
promgw /etc/promgw/config.yaml

# Enable the /all bulk endpoint
promgw --all

# Help
promgw --help
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `RUST_LOG` | Log level (e.g. `debug`, `info`, `warn`, `error`) | `info` |

```bash
# Enable debug logging
RUST_LOG=debug promgw

# Enable tracing debug
RUST_LOG=trace promgw
```

## License

MIT
