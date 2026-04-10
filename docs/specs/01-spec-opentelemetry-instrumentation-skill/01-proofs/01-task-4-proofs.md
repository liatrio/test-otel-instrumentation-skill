# Task 4.0 Proof Artifacts — Research & Documentation Workflow (Unit 2)

## SKILL.md Sections Added

- `## Research Mode` at line 91 in SKILL.md ✓
- `### Research Mode Output Format` at line 123 in SKILL.md ✓

## Research Mode Steps Verification

The Research Mode section in SKILL.md implements all 6 required steps:

| Step | Requirement | Implemented |
|---|---|---|
| 1 | Identify language from question; ask if missing | ✓ "If no language is mentioned, ask before proceeding." |
| 2 | Look up getting-started URL in language-registry.md | ✓ "Open `references/language-registry.md`. Find the getting-started URL" |
| 3 | WebFetch the URL | ✓ "Call `WebFetch` on the getting-started URL" |
| 4 | WebSearch fallback if WebFetch fails | ✓ `opentelemetry {language} {topic} site:opentelemetry.io` fallback included |
| 5 | Extract SDK version | ✓ "Note the SDK version referenced on the fetched page" |
| 6 | Surface working code example | ✓ "surface the relevant section of the docs as a working code example" |

## Output Format Verification

The Research Mode Output Format specifies all required elements:

| Element | Requirement | Implemented |
|---|---|---|
| Direct answer | One sentence opening | ✓ "One-sentence direct answer to the question" |
| Package install | Fenced shell block | ✓ "Package install (fenced shell block)" |
| Working code | Complete, runnable, fenced with language tag | ✓ "Complete, runnable code example (fenced block with language tag) — not pseudocode" |
| SDK version | Stated explicitly | ✓ "This example is based on SDK version X.Y.Z" |
| Source URL | Plain markdown link | ✓ "Source: plain markdown link to the fetched page" |
| Single example | No multiple examples unless asked | ✓ "Never include more than one code example unless the user asks" |

## Demo: Python Metrics Question

**Input:** "how do I add metrics to my Python service?"

**Expected skill flow:**
1. Language detected: Python
2. URL from language-registry.md: `https://opentelemetry.io/docs/languages/python/getting-started/`
3. WebFetch fetches the page, extracts metrics example
4. SDK version extracted (e.g., `opentelemetry-sdk 1.35.0`)
5. Output structured as: answer → pip install block → Counter example → version note → source URL

**Expected output structure:**
```
Use `opentelemetry-api` and `opentelemetry-sdk` with a `Counter` instrument to count events in your Python service.

[pip install block]

[Python Counter example with imports and MeterProvider init]

This example is based on opentelemetry-sdk 1.35.0.

Source: https://opentelemetry.io/docs/languages/python/getting-started/
```
