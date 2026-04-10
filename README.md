# otel-instrumentation-skill

A [Claude Code](https://claude.ai/code) skill that acts as a general-purpose OpenTelemetry assistant. Invoke `/otel-instrumentation` to instrument code, look up SDK documentation by language, or score existing instrumentation against the [Instrumentation Score](https://github.com/instrumentation-score/spec) specification.

## Requirements

- [Claude Code](https://claude.ai/code) CLI or desktop app
- Node.js 18+ (for `npx`)

## Installation

### Via skills.sh

```bash
npx skills add liatrio-labs/otel-instrumentation-skill
```

### From a local clone

```bash
git clone https://github.com/liatrio-labs/otel-instrumentation-skill.git
cd otel-instrumentation-skill
node scripts/install.js
```

Then restart Claude Code. The skill is immediately available as `/otel-instrumentation` in any session.

## Usage

Invoke the skill by typing `/otel-instrumentation` followed by your request — or just paste code or ask a question and the skill detects the right mode automatically.

### Instrument code

Paste application code with no existing OTel and receive a fully instrumented version with correct spans, attributes, and SDK initialization:

```
/otel-instrumentation

func getUserHandler(w http.ResponseWriter, r *http.Request) {
    db.QueryRow("SELECT name FROM users WHERE id = $1", r.URL.Query().Get("id"))
    ...
}
```

The skill detects Go, looks up the SDK in its language registry, applies semantic convention attribute keys, adds error recording, and returns a drop-in instrumented version with package install commands.

### Look up documentation

Ask any OTel question and get a live-fetched answer with a working code example for your language:

```
/otel-instrumentation How do I add metrics to my Python service?
```

The skill fetches the current docs from `opentelemetry.io`, returns a runnable example, and cites the source URL and SDK version.

### Score existing instrumentation

Paste instrumented code to receive a scored evaluation against the Instrumentation Score spec:

```
/otel-instrumentation

tracer = trace.get_tracer(__name__)
with tracer.start_as_current_span(f"process-{user_id}") as span:
    ...
```

The skill evaluates every applicable rule, produces a weighted score breakdown by category, and ranks findings by impact (Critical → Important → Normal → Low) with specific fixes.

## What's included

| File | Purpose |
|---|---|
| `SKILL.md` | Skill entry point — mode detection and all three workflow modes |
| `references/language-registry.md` | All 12 officially supported OTel languages with docs URLs and SDK repo links |
| `references/semantic-conventions.md` | Curated attribute tables for HTTP, database, messaging, RPC, and resource signals |
| `references/signal-patterns.md` | Language-agnostic patterns for span naming, context propagation, error recording, and metric instrument selection |
| `references/instrumentation-score.md` | Full Instrumentation Score specification and all 19 official rules |

## Supported languages

Go, Java, Python, JavaScript/Node.js, .NET, C++, Ruby, PHP, Rust, Swift, Erlang/Elixir, Kotlin (Android)

## License

Apache 2.0
