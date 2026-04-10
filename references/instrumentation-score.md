# Instrumentation Score Reference

This file is used by the `otel-instrumentation` skill during the scoring workflow. It contains the full Instrumentation Score specification and all official rules. When evaluating code, evaluate against every applicable rule in this document and cite rule IDs in findings.

> Source: https://github.com/instrumentation-score/spec — verified April 2026

---

## Specification

### Introduction

The OpenTelemetry project provides a powerful, vendor-neutral framework for instrumenting, generating, collecting, and exporting telemetry data (traces, metrics, logs). However, as adoption grows, organizations often face challenges with the *quality* and *consistency* of their instrumentation. Issues like missing critical attributes (e.g., `service.name`), inefficient use of telemetry signals (e.g., using verbose logs where metrics suffice), high cardinality, or incomplete traces can hinder observability effectiveness, increase costs, and make troubleshooting difficult.

The **Instrumentation Score** is a numerical value ranging from **0 to 100** that provides a quantifiable measure of how well a service or system is instrumented according to OpenTelemetry best practices and semantic conventions. It is calculated by analyzing OpenTelemetry Protocol (OTLP) data streams against a defined set of rules.

### Score Calculation Formula

Each rule has an **Impact** level with an associated weight:

| Impact | Weight |
|---|---|
| Critical | 40 |
| Important | 30 |
| Normal | 20 |
| Low | 10 |

**Formula:**

```
Score = (Σ passed_rules × weight) / (Σ total_rules × weight) × 100
```

**Example:** Critical: 4/8 passed, Important: 8/10, Normal: 6/8, Low: 1/5

```
Score = ((4×40) + (8×30) + (6×20) + (1×10)) / ((8×40) + (10×30) + (8×20) + (5×10)) × 100
      = 530 / 830 × 100
      ≈ 63.86
```

### Qualitative Categories

| Score Range | Category | Guidance |
|---|---|---|
| 90–100 | **Excellent** | High standard of instrumentation quality |
| 75–89 | **Good** | Solid quality; minor improvements possible |
| 50–74 | **Needs Improvement** | Tangible issues requiring attention |
| 0–49 | **Poor** | Significant problems needing urgent action |

---

## Rules

Rules are organized by **Target**, then sorted by **Impact** (Critical → Important → Normal → Low).

---

### Resource Rules (RES)

These rules apply to the OTLP Resource — the set of attributes that describe the entity producing telemetry (typically a service or process).

---

#### RES-005 — Critical

**Description:** `service.name` resource attribute is present and non-empty.

**Rationale:** `service.name` is the most fundamental resource attribute. It enables all service-level analysis, dashboards, and alerting. Without it, telemetry cannot be attributed to a specific service, making the data nearly useless for operations.

**Criteria:** The `service.name` resource attribute MUST be present, non-empty, and non-null. For horizontally scaled deployments, it MUST be the same for all instances of the same logical service.

**Common violations:**
- `service.name` is missing entirely
- `service.name` is set to `unknown_service` (the SDK default — must be overridden)
- `service.name` contains the hostname or pod name instead of the logical service name

---

#### RES-002 — Important

**Description:** `service.instance.id` is unique across logical resources within a given `service.name`.

**Rationale:** The instance ID should not be shared among different workloads, as doing so undermines the uniqueness guarantee that makes this attribute valuable for identifying individual pods or processes.

**Criteria:** The `service.instance.id` attribute MUST be unique across logical resources. For example, two different Kubernetes pods MUST NOT share the same `service.instance.id`.

---

#### RES-003 — Important

**Description:** `k8s.pod.uid` resource attribute is present on resources associated with telemetry from Kubernetes pods.

**Rationale:** Enables telemetry correlation through processors like `k8sattributeprocessor`. More robust than `k8s.pod.ip` when service meshes (Istio, Linkerd) are involved.

**Criteria:** Resources describing Kubernetes pods MUST include the `k8s.pod.uid` attribute. OTel SDKs in Kubernetes can auto-collect this from cgroup metadata.

---

#### RES-004 — Important

**Description:** Semantic convention attributes are used at the correct OTLP level (resource vs. span vs. metric datapoint vs. log record).

**Rationale:** Semantic conventions specify both the attribute key and the appropriate OTLP level where it should appear. Placing attributes at the wrong level complicates analysis and querying.

**Criteria:** Attribute keys specified in semantic conventions MUST appear at the correct level in OTLP.

**Common violations:**
- `service.name` placed on individual spans instead of the Resource
- `http.request.method` placed on the Resource instead of the span

---

#### RES-001 — Normal

**Description:** `service.instance.id` resource attribute is present.

**Rationale:** Uniquely identifies a resource instance, enabling independent identification without taking other resource attributes into account. Essential for correlating telemetry from specific pods or processes.

**Criteria:** The `service.instance.id` resource attribute MUST be present in the resource configuration.

---

### Span Rules (SPA)

These rules apply to trace spans in OTLP.

---

#### SPA-003 — Important

**Description:** Span names have bounded (low) cardinality.

**Rationale:** High-cardinality span names (e.g., those containing user IDs, literal URL paths, or query parameters) diminish the usefulness of grouping operations, weaken filtering capabilities, and can overwhelm indexes in observability backends.

**Criteria:** Span names MUST NOT contain high-cardinality values. HTTP and database span names in particular must use templates, not literal values. See `signal-patterns.md` for naming patterns.

**Common violations:**
- HTTP server span named `GET /users/12345` instead of `GET /users/{id}`
- DB span named `SELECT * FROM orders WHERE id = 456` instead of `SELECT orders`

---

#### SPA-004 — Important

**Description:** Root spans are not `CLIENT` spans.

**Rationale:** Root spans should describe the initial request or workload that begins a trace. `CLIENT` spans represent outbound requests and lack context about why those requests occur. A root `CLIENT` span typically indicates missing incoming instrumentation or lost trace context.

**Criteria:** A root span (a span with no parent) MUST NOT have `span.kind = SpanKind.CLIENT`. Exception: spans from browser bundles where there is no server-side entry point.

---

#### SPA-005 — Important

**Description:** Traces do not contain a high number of short-duration spans.

**Rationale:** Excessive very short-duration internal spans may indicate over-instrumentation, instrumentation overhead, or inefficient code. They add noise and cost without adding observability value.

**Criteria:** When grouping spans by `trace_id`, each trace MUST NOT have more than 20 spans with a `duration` of less than 5 milliseconds.

---

#### SPA-001 — Normal

**Description:** Traces contain a limited number of `INTERNAL` spans per service.

**Rationale:** Services generating excessive internal spans may signal inefficient operations, and complicate observability by burying meaningful spans in noise.

**Criteria:** When grouping spans by trace identifier and `service.name`, no more than 10 spans in a single trace SHOULD have `span.kind = SpanKind.INTERNAL`.

---

#### SPA-002 — Normal

**Description:** Traces do not contain orphan spans.

**Rationale:** Orphaned spans (spans whose parent span does not exist in the trace) indicate problems in instrumentation or data integrity. They result in incomplete or misleading trace visualizations.

**Criteria:** Given any span with a `parent_span_id`, there MUST exist a span with the same `trace_id` whose `span_id` equals that `parent_span_id`.

**Common causes:**
- Selective sampling that drops parent spans but keeps child spans
- Instrumentation that creates child spans before the parent span is started

---

### Metric Rules (MET)

These rules apply to metrics in OTLP.

---

#### MET-001 — Important

**Description:** Metric attribute cardinality is bounded.

**Rationale:** High-cardinality metric attributes generate excessive unique time series, degrading observability platform performance and driving up storage costs.

**Criteria:** Attribute keys on metrics, aggregated by metric name, MUST have fewer than 10,000 unique values within a 1-hour window.

**Common violations:**
- Using `user_id`, `request_id`, or `url` as metric attributes
- Using unbounded string attributes (e.g., free-form error messages) on metrics

---

#### MET-002 — Important

**Description:** Metrics have useful, non-default unit values.

**Rationale:** Units are fundamental for understanding what a metric means and how to analyze it. The difference between 1% and 1MB illustrates why units matter.

**Criteria:** All metrics MUST have a non-default, non-empty unit of measurement compliant with the Unified Code for Units of Measure (UCUM) standard. Common units: `s`, `ms`, `By`, `%`, `1`.

---

#### MET-003 — Important

**Description:** Metric names are consistently associated with the same unit across all producers.

**Rationale:** Different services might use the same metric name with different units, creating analytical confusion when aggregating across services.

**Criteria:** For any given metric name, all time series recorded within a 14-day period MUST use the same unit of measurement.

---

#### MET-006 — Important

**Description:** Metric names do not equal semantic convention attribute keys.

**Rationale:** A metric name that exactly matches an attribute key (e.g., `http.response.status_code`) causes confusion between metric names and span-level attributes.

**Criteria:** Metric names MUST NOT equal any attribute key specified in the OTel Semantic Conventions.

---

#### MET-004 — Normal

**Description:** Histogram metrics consistently use the same bucket boundaries per metric name.

**Rationale:** Histograms use buckets to count occurrences in ranges. Inconsistent bucket configurations across producers make quantile aggregations imprecise.

**Criteria:** Given a metric name, all histogram time series with that name in the past 14 days MUST have the same histogram bucket boundaries.

---

#### MET-005 — Normal

**Description:** Metric names do not contain the metric unit.

**Rationale:** Units are already specified separately in the OTLP metric model. Including the unit in the name is redundant and creates brittleness if the unit changes.

**Criteria:** Metric names MUST NOT contain the metric unit string.

**Common violations:**
- `collection.duration.seconds` → should be `collection.duration` with unit `s`
- `request.size.bytes` → should be `request.size` with unit `By`

---

### Log Rules (LOG)

These rules apply to log records in OTLP.

---

#### LOG-001 — Important

**Description:** Debug-level logs are not enabled in production environments for longer than 14 days.

**Rationale:** Retaining debug logs long-term in production leads to increased storage costs, potential security exposure (sensitive values in debug output), and noisy logs that make troubleshooting harder.

**Criteria:** Log records with `severity.text = DEBUG` MUST NOT be observed in a production environment (identified by `deployment.environment.name = production`) for longer than 14 consecutive days.

---

#### LOG-002 — Important

**Description:** Log records have `severityNumber` properly set (not `UNSET`).

**Rationale:** When using the OTel filelog receiver or similar integrations, adopters commonly fail to configure severity parsing. Without `severityNumber`, logs cannot be filtered or sorted by severity.

**Criteria:** No log record with `severity.text = UNSET` (or `severityNumber = 0`) should be observed in production. The log pipeline MUST be configured to parse and populate `severityNumber` from the log's severity field.

---

### SDK Rules (SDK)

These rules apply to SDK configuration and versioning.

---

#### SDK-001 — Low

**Description:** SDK dependencies (language and runtime) are within supported versions.

**Rationale:** Using unsupported language or runtime versions means missing community support, bug fixes, and alignment with the latest Semantic Conventions.

**Criteria:** Language and runtime versions used with the OTel SDK SHOULD be within the SDK's officially supported version range.

**Example:** The JS SDK v2.0.1 supports Node.js 18, 20, 22 and TypeScript v5.0.4+. Using Node.js 16 with this SDK version violates this rule.

---

## Quick Reference: All Rules

| Rule ID | Target | Impact | Description |
|---|---|---|---|
| RES-005 | Resource | Critical | `service.name` is present and non-empty |
| RES-002 | Resource | Important | `service.instance.id` is unique per logical resource |
| RES-003 | Resource | Important | `k8s.pod.uid` present for Kubernetes pods |
| RES-004 | Resource | Important | Semconv attributes at correct OTLP level |
| SPA-003 | Span | Important | Span names have low cardinality |
| SPA-004 | Span | Important | Root spans are not CLIENT spans |
| SPA-005 | Span | Important | No high number of short-duration spans |
| MET-001 | Metric | Important | Metric attribute cardinality < 10,000/hour |
| MET-002 | Metric | Important | Metrics have non-default unit values |
| MET-003 | Metric | Important | Metric unit consistent across producers |
| MET-006 | Metric | Important | Metric names ≠ semconv attribute keys |
| LOG-001 | Log | Important | Debug logs not active in production > 14 days |
| LOG-002 | Log | Important | `severityNumber` is set (not UNSET) |
| RES-001 | Resource | Normal | `service.instance.id` is present |
| SPA-001 | Span | Normal | ≤10 INTERNAL spans per service per trace |
| SPA-002 | Span | Normal | No orphan spans |
| MET-004 | Metric | Normal | Histogram bucket boundaries consistent |
| MET-005 | Metric | Normal | Metric names don't contain units |
| SDK-001 | SDK | Low | SDK dependencies within supported version range |
