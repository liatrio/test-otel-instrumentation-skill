# Task 1.0 Proof Artifacts — Bootstrap Project Structure

## File: SKILL.md

`SKILL.md` exists at the project root with valid YAML frontmatter.

```yaml
---
name: otel-instrumentation
description: OpenTelemetry assistant for engineers. Use when asked to add OTel instrumentation to application code, look up SDK documentation or examples by language, or evaluate and score existing instrumentation quality against the Instrumentation Score specification. Triggers include "instrument this code", "add tracing/metrics/logs", "how do I use OTel in [language]", "score my instrumentation", "review my spans", or any request involving OpenTelemetry implementation or best practices.
allowed-tools: WebFetch, WebSearch
---
```

**Verified fields:**
- `name: otel-instrumentation` ✓
- `description` captures all three workflows (instrument, research, score) ✓
- `allowed-tools: WebFetch, WebSearch` ✓
- Format matches existing skills (`agent-browser`, `frontend-design`) ✓

## Directory: references/

`references/` directory exists at the project root with a `.gitkeep` placeholder.

```
opentelemetry-skill/
├── SKILL.md
├── references/
│   └── .gitkeep
└── docs/
    ├── mcp-context.md
    └── specs/
        └── 01-spec-opentelemetry-instrumentation-skill/
```

## Frontmatter Format Reference

Verified against `~/.claude/skills/agent-browser/SKILL.md` and `~/.claude/skills/frontend-design/SKILL.md`:
- Required fields: `name`, `description`
- Optional fields: `allowed-tools`, `license`
- No additional fields present in existing skills
- SKILL.md format matches convention ✓
