# OpenTelemetry Language Registry

This file is used by the `otel-instrumentation` skill as a lookup table when resolving language-specific documentation URLs and SDK repository links. When a user's language is identified, look up the row and use the URLs provided.

> Source: https://opentelemetry.io/docs/languages/ — verified April 2026

## Supported Languages

| Language | Getting Started URL | SDK Repository | Zero-Code Available |
|---|---|---|---|
| C++ | https://opentelemetry.io/docs/languages/cpp/getting-started/ | https://github.com/open-telemetry/opentelemetry-cpp | No |
| .NET | https://opentelemetry.io/docs/languages/dotnet/getting-started/ | https://github.com/open-telemetry/opentelemetry-dotnet | Yes |
| Erlang / Elixir | https://opentelemetry.io/docs/languages/erlang/getting-started/ | https://github.com/open-telemetry/opentelemetry-erlang | No |
| Go | https://opentelemetry.io/docs/languages/go/getting-started/ | https://github.com/open-telemetry/opentelemetry-go | Yes |
| Java | https://opentelemetry.io/docs/languages/java/getting-started/ | https://github.com/open-telemetry/opentelemetry-java | Yes |
| JavaScript / Node.js | https://opentelemetry.io/docs/languages/js/getting-started/ | https://github.com/open-telemetry/opentelemetry-js | Yes |
| Kotlin (Android) | https://opentelemetry.io/docs/languages/kotlin/ | https://github.com/open-telemetry/opentelemetry-android | No |
| PHP | https://opentelemetry.io/docs/languages/php/getting-started/ | https://github.com/open-telemetry/opentelemetry-php | Yes |
| Python | https://opentelemetry.io/docs/languages/python/getting-started/ | https://github.com/open-telemetry/opentelemetry-python | Yes |
| Ruby | https://opentelemetry.io/docs/languages/ruby/getting-started/ | https://github.com/open-telemetry/opentelemetry-ruby | No |
| Rust | https://opentelemetry.io/docs/languages/rust/getting-started/ | https://github.com/open-telemetry/opentelemetry-rust | No |
| Swift | https://opentelemetry.io/docs/languages/swift/getting-started/ | https://github.com/open-telemetry/opentelemetry-swift | No |

## Signal Stability by Language

| Language | Traces | Metrics | Logs |
|---|---|---|---|
| C++ | Stable | Stable | Stable |
| .NET | Stable | Stable | Stable |
| Erlang / Elixir | Stable | Development | Development |
| Go | Stable | Stable | Beta |
| Java | Stable | Stable | Stable |
| JavaScript / Node.js | Stable | Stable | Development |
| Kotlin (Android) | Development | Development | Development |
| PHP | Stable | Stable | Stable |
| Python | Stable | Stable | Development |
| Ruby | Stable | Development | Development |
| Rust | Beta | Beta | Beta |
| Swift | Stable | Development | Development |

## Docs URL Pattern

When fetching docs for a specific topic (e.g., manual instrumentation, exporters, metrics), use:

```
https://opentelemetry.io/docs/languages/{language-slug}/{topic}/
```

Common topics:
- `getting-started/` — minimal working example
- `instrumentation/` — manual span/metric/log creation
- `exporters/` — configuring OTLP and other exporters
- `automatic/` — zero-code / auto-instrumentation (not all languages)

Language slugs from the table: `cpp`, `dotnet`, `erlang`, `go`, `java`, `js`, `kotlin`, `php`, `python`, `ruby`, `rust`, `swift`
