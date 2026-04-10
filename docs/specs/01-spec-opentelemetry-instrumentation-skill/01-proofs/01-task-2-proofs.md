# Task 2.0 Proof Artifacts — Author Reference Documents

## File: references/language-registry.md

All 12 officially supported OTel languages present with getting-started URLs and SDK repo links.

**Languages covered:** C++, .NET, Erlang/Elixir, Go, Java, JavaScript/Node.js, Kotlin (Android), PHP, Python, Ruby, Rust, Swift

**Source fetched:** https://opentelemetry.io/docs/languages/ (April 2026)

**Sample entries:**
```markdown
| Go | https://opentelemetry.io/docs/languages/go/getting-started/ | https://github.com/open-telemetry/opentelemetry-go | Yes |
| Python | https://opentelemetry.io/docs/languages/python/getting-started/ | https://github.com/open-telemetry/opentelemetry-python | Yes |
| Java | https://opentelemetry.io/docs/languages/java/getting-started/ | https://github.com/open-telemetry/opentelemetry-java | Yes |
```

---

## File: references/semantic-conventions.md

Curated semantic convention tables covering all required signal categories.

**Sections present:**
- General / Shared Attributes (error.type, server.*, client.*, network.*)
- HTTP Spans (client + server, sourced from https://opentelemetry.io/docs/specs/semconv/http/http-spans/)
- Database Spans (sourced from https://opentelemetry.io/docs/specs/semconv/database/database-spans/)
- Messaging Spans (sourced from https://opentelemetry.io/docs/specs/semconv/messaging/messaging-spans/)
- RPC Spans (sourced from https://opentelemetry.io/docs/specs/semconv/rpc/rpc-spans/)
- Resource Attributes

**Attribute key accuracy check (sampling):**
- `http.request.method` — Required, string ✓
- `http.response.status_code` — Conditionally Required, int ✓
- `db.system.name` — Required, string ✓
- `messaging.operation.name` — Required, string ✓
- `rpc.system.name` — Required, string ✓
- `service.name` — Critical resource attribute ✓

---

## File: references/signal-patterns.md

Language-agnostic patterns for all four required topics.

**Sections present:**
- Span Naming Conventions (good vs. bad table + naming patterns by signal type)
- Context Propagation (W3C TraceContext format, Baggage, propagation rules)
- Error Recording (3-step sequence: recordException → setStatus ERROR → set error.type)
- Metric Instrument Selection Guide (7-instrument table with when-to-use)
- Log Correlation (trace_id/span_id injection, severity number mapping)
- Instrumentation Scope
- Sampling

---

## File: references/instrumentation-score.md

Full Instrumentation Score specification and all 19 official rules.

**Specification sections present:**
- Introduction
- Score Calculation Formula (weighted formula with example)
- Qualitative Categories (Excellent/Good/Needs Improvement/Poor)

**Rules fetched:** 19 rules across 5 targets
- Resource: RES-001 (Normal), RES-002 (Important), RES-003 (Important), RES-004 (Important), RES-005 (Critical)
- Span: SPA-001 (Normal), SPA-002 (Normal), SPA-003 (Important), SPA-004 (Important), SPA-005 (Important)
- Metric: MET-001 (Important), MET-002 (Important), MET-003 (Important), MET-004 (Normal), MET-005 (Normal), MET-006 (Important)
- Log: LOG-001 (Important), LOG-002 (Important)
- SDK: SDK-001 (Low)

**Organization:** Grouped by Target, sorted Critical → Important → Normal → Low within each group ✓

**Quick reference table** present at end of document for fast rule lookup ✓

**Sources fetched:**
- https://raw.githubusercontent.com/instrumentation-score/spec/main/specification.md
- https://api.github.com/repos/instrumentation-score/spec/contents/rules (all 19 rule files)
