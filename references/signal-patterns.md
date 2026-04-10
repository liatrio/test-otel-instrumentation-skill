# OpenTelemetry Signal Patterns Reference

This file is used by the `otel-instrumentation` skill to apply correct instrumentation patterns regardless of programming language. All patterns are derived from the OpenTelemetry specification.

---

## Span Naming Conventions

**Rule:** Span names must be low-cardinality. They should describe the operation type, not the specific data being operated on.

### Good vs. Bad Span Names

| Signal Type | Bad (High Cardinality) | Good (Low Cardinality) |
|---|---|---|
| HTTP server | `GET /users/12345` | `GET /users/{id}` |
| HTTP client | `POST https://api.acme.com/v1/orders/98` | `POST` |
| Database | `SELECT * FROM orders WHERE id = 456` | `SELECT orders` |
| RPC | `UserService.GetUser(id=123)` | `com.example.UserService/GetUser` |
| Background job | `process-message-abc-123` | `process` |
| Generic | `doTheThing(foo, bar)` | `do the thing` |

### Naming Patterns by Signal

| Operation Type | Span Name Pattern | Example |
|---|---|---|
| HTTP server | `{METHOD} {route_template}` | `GET /api/users/{id}` |
| HTTP client | `{METHOD}` | `POST` |
| Database | `{OPERATION} {table_or_collection}` | `SELECT users`, `INSERT orders` |
| gRPC | `{package}.{Service}/{Method}` | `com.example.UserSvc/GetUser` |
| Messaging publish | `{operation} {destination}` | `publish orders` |
| Messaging receive | `{operation} {destination}` | `receive payments` |
| General / internal | Short verb-noun describing the work | `parse config`, `load user` |

### Key Rules
- Never embed user IDs, request IDs, timestamps, or other high-cardinality values in span names
- Use the route template (e.g., `/users/{id}`), never the actual URL path
- For DB spans: use the operation + table/collection, never the full query string
- Keep names short — prefer `SELECT users` over `SELECT from users table`

---

## Context Propagation

Context propagation is how trace context (trace ID, span ID, sampling decision) travels across service boundaries.

### W3C TraceContext (Primary Standard)

The primary propagation format. Uses two HTTP headers:

```
traceparent: 00-{trace-id}-{parent-span-id}-{trace-flags}
tracestate:  {vendor-specific-key}={value}
```

**Example:**
```
traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
```

Format breakdown:
- `00` — version
- `4bf92f3577b34da6a3ce929d0e0e4736` — 32-hex trace ID
- `00f067aa0ba902b7` — 16-hex parent span ID
- `01` — trace flags (`01` = sampled)

### W3C Baggage

Carries user-defined key-value pairs alongside trace context:

```
baggage: userId=alice,serverNode=iad-node-xyz,isProduction=false
```

**Use baggage for:** business context that needs to flow through the entire trace (e.g., tenant ID, experiment ID).
**Do not use baggage for:** high-cardinality values or sensitive PII.

### Propagation Rules

1. **Incoming requests:** Extract context from inbound headers before creating any spans
2. **Outgoing requests:** Inject context into outbound headers before sending
3. **Async/message queues:** Inject context into message headers/attributes, extract at consumer
4. **Never create a new root span** when a valid incoming trace context exists

---

## Error Recording

When an operation fails, follow this exact sequence — all three steps are required:

### Step 1: Record the Exception

```
span.recordException(exception)
```

This captures the exception type, message, and stack trace as a span event.

### Step 2: Set the Span Status to Error

```
span.setStatus(StatusCode.ERROR, "human-readable description of what failed")
```

The status description should explain what the operation was trying to do, not repeat the exception message.

### Step 3: Set `error.type` Attribute

```
span.setAttribute("error.type", exceptionClassName)
```

Use the fully-qualified exception/error class name (e.g., `java.io.IOException`, `ConnectionRefusedError`, `net/http: request canceled`). Use `_OTHER` for errors that don't map to a specific class.

### Important: When NOT to Record Errors

Not every non-2xx HTTP status is an error from the server's perspective:
- HTTP server spans: set status to Error **only for 5xx responses** — 4xx are client errors, not server errors
- HTTP client spans: set status to Error for **any response that represents a failure from the client's perspective** (typically 4xx and 5xx)
- Never set `span.setStatus(OK)` explicitly — leave it unset if the operation succeeded (unset is treated as OK)

---

## Metric Instrument Selection Guide

| Instrument | When to Use | Example |
|---|---|---|
| **Counter** | Value only increases monotonically; you care about rate/total | Requests processed, bytes sent, errors |
| **UpDownCounter** | Value can increase or decrease; you care about current total | Active connections, queue depth, cache size |
| **Histogram** | Measures distribution of a value; you want percentiles/averages | Request duration, payload size, DB query time |
| **Gauge** | Point-in-time measurement that doesn't accumulate | CPU usage %, memory used, temperature |
| **ObservableCounter** | Like Counter but value is read at collection time, not recorded | CPU time (from OS), total bytes (from NIC) |
| **ObservableUpDownCounter** | Like UpDownCounter but read at collection time | Heap used (from runtime), thread count |
| **ObservableGauge** | Like Gauge but read at collection time | File descriptor count, JVM memory pools |

### Metric Naming Rules

- Use `{namespace}.{noun}.{unit}` pattern: `http.server.request.duration`
- Unit goes in the `unit` field of the metric — **never in the name**: use `request.duration` + unit `s`, not `request.duration.seconds`
- Use snake_case or dot-separated names, be consistent within a service
- Metric names must not equal any semantic convention attribute key (see `semantic-conventions.md`)

### Recommended Units (UCUM)

| What you're measuring | Unit |
|---|---|
| Duration / latency | `s` (seconds), `ms` (milliseconds) |
| Byte counts | `By` (bytes) |
| Percentages | `%` (but prefer ratios `1` when possible) |
| Counts | `{request}`, `{error}`, `{connection}` (dimensionless with descriptor) |
| Ratios | `1` |

---

## Log Correlation (Trace Context in Logs)

Logs become dramatically more useful when they include the trace ID and span ID of the current operation.

### Required Log Fields

When emitting a log record during a traced operation, include:

| Field | Description |
|---|---|
| `trace_id` | The current trace ID (32-hex string) |
| `span_id` | The current span ID (16-hex string) |
| `trace_flags` | Sampling flags (`01` = sampled) |

### How It Works

The OTel SDK injects these fields automatically when you use the OTel Logging API or the `LoggingInstrumentor` (for existing logging frameworks). If using a manual approach, read the current span context from the tracer and inject the IDs into your log record.

### Severity Levels

Map your framework's log levels to OTel severity numbers:

| OTel SeverityNumber | Severity Text | Common Framework Mapping |
|---|---|---|
| 1–4 | TRACE | TRACE |
| 5–8 | DEBUG | DEBUG |
| 9–12 | INFO | INFO |
| 13–16 | WARN | WARN / WARNING |
| 17–20 | ERROR | ERROR |
| 21–24 | FATAL | FATAL / CRITICAL |

Always configure the OTel log receiver/instrumentation to parse and populate `severityNumber` — leaving it as `UNSET` (0) makes logs unsortable by severity.

---

## Instrumentation Scope

Every span, metric, and log should be emitted from a named instrumentation scope (sometimes called a tracer/meter/logger name). This identifies which library or component created the signal.

- **Library/framework instrumentation:** use the library package name + version (e.g., `github.com/open-telemetry/opentelemetry-go-contrib/instrumentation/net/http/otelhttp v0.60.0`)
- **Application instrumentation:** use the application module/package name (e.g., `com.example.myapp.payments`)
- Never use an empty string as the scope name

---

## Sampling

Sampling decisions affect whether a trace is recorded. Key rules:

- **Head-based sampling:** The decision is made at the root span. Child spans inherit the decision — never override it.
- **Tail-based sampling:** The decision is made after the trace is complete (handled by the OTel Collector, not the SDK).
- **Parent-based sampler (default):** Respects incoming sampling decisions from upstream services. Recommended for most applications.
- Never drop spans selectively within a trace — this creates orphan spans (violates SPA-002).
