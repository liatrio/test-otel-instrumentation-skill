# Task 3.0 Proof Artifacts — Code Instrumentation Workflow (Unit 1)

## SKILL.md Sections Added

The following sections are now present in `SKILL.md`:

1. **Mode Detection table** — maps user input patterns to instrument/research/score mode ✓
2. **Instrument Mode** — 7-step procedure with references to all three reference docs ✓
3. **Instrument Mode Output Format** — 3-block structure (install → init → instrumented code) ✓

## Demo: Go HTTP Handler Instrumentation

**Input given to skill:**

```go
package main

import (
    "database/sql"
    "encoding/json"
    "net/http"
)

func getUserHandler(w http.ResponseWriter, r *http.Request) {
    userID := r.URL.Query().Get("id")

    db, _ := sql.Open("postgres", "postgres://localhost/myapp")
    row := db.QueryRow("SELECT name, email FROM users WHERE id = $1", userID)

    var name, email string
    if err := row.Scan(&name, &email); err != nil {
        http.Error(w, "user not found", http.StatusNotFound)
        return
    }

    json.NewEncoder(w).Encode(map[string]string{"name": name, "email": email})
}

func main() {
    http.HandleFunc("/users", getUserHandler)
    http.ListenAndServe(":8080", nil)
}
```

**Expected skill output — Block 1 (Package Install):**

```shell
# Install required OTel packages
go get go.opentelemetry.io/otel
go get go.opentelemetry.io/otel/sdk
go get go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc
go get go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp
```

**Expected skill output — Block 2 (SDK Initialization):**

```go
func initTracer() func(context.Context) error {
    // Configure OTLP gRPC exporter — sends traces to OTel Collector
    exporter, _ := otlptracegrpc.New(context.Background())

    // Resource identifies this service in all telemetry
    // service.name MUST be set — never leave it as "unknown_service"
    res := resource.NewWithAttributes(
        semconv.SchemaURL,
        semconv.ServiceName("my-user-service"),
        semconv.ServiceVersion("1.0.0"),
    )

    tp := sdktrace.NewTracerProvider(
        sdktrace.WithBatcher(exporter),
        sdktrace.WithResource(res),
    )
    otel.SetTracerProvider(tp)
    otel.SetTextMapPropagator(propagation.TraceContext{}) // W3C TraceContext propagation
    return tp.Shutdown
}
```

**Expected skill output — Block 3 (Instrumented Code):**

```go
func main() {
    shutdown := initTracer()
    defer shutdown(context.Background())

    // otelhttp middleware automatically creates an HTTP server span for every request
    // span name will be "GET /users" (method + route) — low cardinality
    http.Handle("/users", otelhttp.NewHandler(http.HandlerFunc(getUserHandler), "/users"))
    http.ListenAndServe(":8080", nil)
}

func getUserHandler(w http.ResponseWriter, r *http.Request) {
    // Retrieve the active span created by otelhttp middleware
    span := trace.SpanFromContext(r.Context())

    userID := r.URL.Query().Get("id")
    // Add the user ID as a span attribute — do NOT include it in the span name
    span.SetAttributes(attribute.String("app.user.id", userID))

    db, _ := sql.Open("postgres", "postgres://localhost/myapp")

    // Create a child span for the database query
    ctx, dbSpan := otel.Tracer("my-user-service").Start(r.Context(), "SELECT users",
        // db.system.name — required attribute per semantic conventions
        trace.WithAttributes(
            semconv.DBSystemNamePostgreSQL,
            attribute.String("db.namespace", "myapp"),
            attribute.String("db.operation.name", "SELECT"),
            attribute.String("db.collection.name", "users"),
            attribute.String("db.query.summary", "SELECT users by id"),
        ),
    )
    defer dbSpan.End()

    row := db.QueryRowContext(ctx, "SELECT name, email FROM users WHERE id = $1", userID)

    var name, email string
    if err := row.Scan(&name, &email); err != nil {
        // Error recording: all three steps required
        dbSpan.RecordException(err)                                    // 1. capture stack trace
        dbSpan.SetStatus(codes.Error, "user not found in database")   // 2. mark span as failed
        dbSpan.SetAttributes(attribute.String("error.type",           // 3. set error.type
            "sql.ErrNoRows"))
        http.Error(w, "user not found", http.StatusNotFound)
        return
    }

    json.NewEncoder(w).Encode(map[string]string{"name": name, "email": email})
}
```

**What was added (expected summary):**
- HTTP server span via `otelhttp` middleware — automatically captures `http.request.method`, `url.path`, `http.response.status_code`
- Database child span `SELECT users` with required `db.system.name`, `db.namespace`, `db.operation.name`, `db.collection.name` attributes
- Error recording on DB failure: `recordException` + `setStatus(ERROR)` + `error.type`
- SDK initialization with resource (`service.name = "my-user-service"`) and W3C TraceContext propagation

## Mode Detection Verification

Verified mode detection logic covers all cases:
- Raw application code (no OTel imports) → Instrument mode ✓
- Question or "how do I" → Research mode ✓
- Code with existing OTel (tracer/span calls) → Score mode ✓
- Ambiguous input → Single clarifying question ✓
