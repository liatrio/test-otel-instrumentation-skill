# 01-tasks-opentelemetry-instrumentation-skill.md

## Relevant Files

- `SKILL.md` — Main skill entry point with YAML frontmatter and full instruction body; this is the only file Claude Code reads when `/otel-instrumentation` is invoked
- `references/language-registry.md` — Lookup table of all officially supported OTel languages with their `opentelemetry.io` docs URL and SDK repo link; the skill reads this to resolve language-specific URLs before calling `WebFetch`
- `references/semantic-conventions.md` — Curated semantic convention tables for HTTP, database, messaging, RPC, and general span attributes; the skill reads this to attribute spans without live API calls
- `references/signal-patterns.md` — Language-agnostic patterns for trace context propagation, error recording, metric instrument selection, and log body/attribute correlation; the skill reads this during instrumentation and scoring
- `references/instrumentation-score.md` — Full Instrumentation Score specification and all rules; the skill reads this during the scoring workflow to evaluate code and cite rule IDs
- `~/.claude/skills/agent-browser/SKILL.md` — Read-only reference for validating correct skill frontmatter format and instruction body conventions
- `~/github/otel-instrumentation-mcp/otel_instrumentation_mcp/instrumentation_score.py` — Read-only source; used to determine the upstream URLs and rule structure when authoring `instrumentation-score.md`
- `docs/mcp-context.md` — Read-only project context; reference if you need background on what the MCP server provided

### Notes

- This project contains only Markdown files — there is no build step, package manager, test runner, or linter to run.
- All content must be accurate: verify attribute key names against the fetched semantic conventions, and verify SDK package names against the fetched language docs before writing them into any reference document.
- File naming: lowercase with hyphens throughout (already followed by all files listed above).
- When authoring reference documents, fetch live content from upstream sources (opentelemetry.io, raw.githubusercontent.com) to ensure accuracy rather than relying on memory.

---

## Tasks

### [ ] 1.0 Bootstrap Project Structure

Create the skill's entry point and directory layout so it is loadable by Claude Code and matches the established skill format (frontmatter + instruction body, `references/` subdirectory).

#### 1.0 Proof Artifact(s)

- File: `SKILL.md` exists at the project root with valid YAML frontmatter (`name: otel-instrumentation`, correct `description`, `allowed-tools: WebFetch, WebSearch`) demonstrates the skill entry point is correctly formed
- File: `references/` directory exists at the project root demonstrates the reference document location is in place

#### 1.0 Tasks

- [x] 1.1 Read `~/.claude/skills/agent-browser/SKILL.md` and `~/.claude/skills/frontend-design/SKILL.md` to confirm the exact frontmatter fields and formatting conventions used by existing skills
- [x] 1.2 Create `SKILL.md` at the project root with the following frontmatter: `name: otel-instrumentation`, a one-sentence `description` that captures all three workflows (instrument, research, score), and `allowed-tools: WebFetch, WebSearch`; leave the instruction body as a single placeholder line (`# Instructions coming in tasks 3–5`) for now
- [x] 1.3 Create the empty `references/` directory at the project root (create a `.gitkeep` file inside it so the directory is trackable)

---

### [ ] 2.0 Author Reference Documents

Write the four static reference documents that the skill's instruction body will cite during all three workflows. Content is sourced from upstream OTel specification repositories fetched live.

#### 2.0 Proof Artifact(s)

- File: `references/language-registry.md` lists all officially supported OTel languages (Go, Java, Python, JavaScript, .NET, Ruby, PHP, Swift, Erlang, Rust, C++, and others) each with a valid `opentelemetry.io` docs URL and SDK repo link demonstrates the skill has a complete language lookup table
- File: `references/semantic-conventions.md` contains curated convention tables for HTTP, database, messaging, RPC, and general span attributes with correct attribute key names demonstrates the skill can attribute spans without hallucinating keys
- File: `references/signal-patterns.md` contains language-agnostic patterns for trace context propagation, error recording, metric instrument selection, and log correlation demonstrates the skill has correct pattern guidance for all three signal types
- File: `references/instrumentation-score.md` contains the full Instrumentation Score specification and all rules fetched from the upstream `instrumentation-score/spec` repo demonstrates the skill can score code without a live API call

#### 2.0 Tasks

- [ ] 2.1 WebFetch `https://opentelemetry.io/docs/languages/` to get the current list of all officially supported languages, then create `references/language-registry.md` with one entry per language containing: language name, `opentelemetry.io` getting-started URL (pattern: `https://opentelemetry.io/docs/languages/{language}/getting-started/`), and the SDK GitHub repo URL (pattern: `https://github.com/open-telemetry/opentelemetry-{language}`)
- [ ] 2.2 WebFetch the semantic conventions for HTTP (`https://opentelemetry.io/docs/specs/semconv/http/`), database (`https://opentelemetry.io/docs/specs/semconv/database/`), messaging (`https://opentelemetry.io/docs/specs/semconv/messaging/`), and RPC (`https://opentelemetry.io/docs/specs/semconv/rpc/`), then create `references/semantic-conventions.md` with one section per signal category containing the most important attribute keys, their types, and whether they are required or recommended
- [ ] 2.3 Create `references/signal-patterns.md` covering four language-agnostic topics: (a) span naming conventions (verb + noun, low-cardinality), (b) context propagation (W3C TraceContext, Baggage), (c) error recording (set span status to Error, record exception, set `error.type`), and (d) metric instrument selection guide (Counter vs. UpDownCounter vs. Histogram vs. Gauge with when-to-use rules) — base this on the OTel specification, not language-specific SDKs
- [ ] 2.4 WebFetch `https://raw.githubusercontent.com/instrumentation-score/spec/main/specification.md` and embed the full content as the first section of `references/instrumentation-score.md`
- [ ] 2.5 WebFetch `https://api.github.com/repos/instrumentation-score/spec/contents/rules` to get the list of rule files; then WebFetch each individual rule file's `download_url` and append all rules to `references/instrumentation-score.md`, formatted as a table grouped by Target (Resource, Span, Metric, Log) and sorted by Impact (Critical → Important → Normal → Low), including: Rule ID, Description, Criteria, and Impact for each rule

---

### [ ] 3.0 Implement Code Instrumentation Workflow (Unit 1)

Write the instruction body section in `SKILL.md` that guides Claude through the "instrument" mode: detect language, look up the SDK in `language-registry.md`, apply spans and attributes following `semantic-conventions.md` and `signal-patterns.md`, and return runnable instrumented code.

#### 3.0 Proof Artifact(s)

- Live session: Invoking `/otel-instrumentation` and pasting a Go HTTP handler (no existing OTel code) → skill returns the same handler wrapped with `otelhttp` middleware, correct `http.request.method`, `url.path`, and `http.response.status_code` span attributes, all required imports, and SDK initialization code demonstrates Unit 1 is complete and correct

#### 3.0 Tasks

- [ ] 3.1 Replace the placeholder instruction body in `SKILL.md` with a "Mode Detection" section that describes how to infer the user's intent: if the user pastes raw application code with no OTel present → instrument mode; if the user asks a question or requests examples → research mode; if the user pastes code that already contains OTel spans/metrics/logs → score mode; if the intent is ambiguous, ask one clarifying question before proceeding
- [ ] 3.2 Add an "Instrument Mode" section to `SKILL.md` with these ordered steps: (1) identify the programming language from the code snippet, (2) look up the correct SDK and instrumentation library in `references/language-registry.md`, (3) identify all instrumentable operations in the code (HTTP handlers, DB calls, outbound requests, background jobs), (4) wrap each operation in a span using naming conventions from `references/signal-patterns.md`, (5) add span attributes using exact key names from `references/semantic-conventions.md`, (6) add error recording following the error pattern in `references/signal-patterns.md`, (7) prepend SDK initialization boilerplate with all required imports and package install commands
- [ ] 3.3 Add an "Instrument Mode Output Format" section to `SKILL.md` that specifies: output a single fenced code block with the language tag, include inline comments on every new OTel line explaining the decision (e.g., `// otelhttp wraps the handler to create a server span automatically`), list required packages in a separate fenced block before the code, and keep all original business logic unchanged

---

### [ ] 4.0 Implement Research & Documentation Workflow (Unit 2)

Write the instruction body section in `SKILL.md` that guides Claude through the "research" mode: detect the target language, look up the docs URL in `language-registry.md`, call `WebFetch` (with `WebSearch` fallback), include the SDK version, and cite the source URL.

#### 4.0 Proof Artifact(s)

- Live session: Invoking `/otel-instrumentation` and asking "how do I add metrics to my Python service?" → skill fetches `https://opentelemetry.io/docs/languages/python/`, returns a working `Counter` example with correct package imports (`opentelemetry-sdk`, `opentelemetry-api`), the resolved SDK version, and the fetched source URL cited demonstrates Unit 2 is complete and live data is correctly retrieved

#### 4.0 Tasks

- [ ] 4.1 Add a "Research Mode" section to `SKILL.md` with these ordered steps: (1) identify the programming language from the user's question (if no language is mentioned, ask before proceeding), (2) look up the getting-started URL in `references/language-registry.md`, (3) call `WebFetch` on the URL, (4) if `WebFetch` returns no useful content or fails, fall back to `WebSearch` with the query `"opentelemetry {language} {topic} site:opentelemetry.io"`, (5) extract the SDK version referenced on the page, (6) surface the relevant section of the docs as a working code example
- [ ] 4.2 Add a "Research Mode Output Format" section to `SKILL.md` that specifies: always open with a one-sentence direct answer to the question, follow with a complete runnable code example in a fenced block with language tag, include the exact package install command for that language's package manager, state the SDK version the example applies to, and close with the source URL as a plain markdown link — never include more than one code example unless the user asks for multiple approaches

---

### [ ] 5.0 Implement Instrumentation Scoring Workflow (Unit 3)

Write the instruction body section in `SKILL.md` that guides Claude through the "score" mode: evaluate submitted code against the rules in `instrumentation-score.md`, produce an overall score with per-category breakdown, list findings as rule-violated → current code → suggested fix, and prioritize by impact.

#### 5.0 Proof Artifact(s)

- Live session: Invoking `/otel-instrumentation` and pasting a Python service with missing `error.type` attributes and non-convention span names → skill returns a scored report that cites the specific violated rule IDs (e.g., `SPA-001`, `ERR-001`), shows the current code next to the corrected version, and ranks findings by impact (high / medium / low) demonstrates Unit 3 is complete and scoring is grounded in the embedded spec

#### 5.0 Tasks

- [ ] 5.1 Add a "Score Mode" section to `SKILL.md` with these ordered steps: (1) identify the programming language, (2) read all rules from `references/instrumentation-score.md`, (3) evaluate the code against every applicable rule grouped by Target (Resource, Span, Metric, Log), (4) for each violated rule record: the Rule ID, the offending line(s), and a concrete fix, (5) compute a simple pass/fail score per category (e.g., "Spans: 4/6 rules passed"), (6) compute an overall score as a percentage of rules passed across all applicable categories
- [ ] 5.2 Add a "Score Mode Output Format" section to `SKILL.md` that specifies: open with the overall score as a percentage and a one-line verdict (e.g., "62% — needs work on error handling and span naming"), follow with a per-category breakdown table (Category | Passed | Failed | Score), then list all findings sorted by Impact (Critical first) using the format: `**[RULE-ID] — [Impact]**: [description of violation]` followed by a "Current" fenced code block and a "Fix" fenced code block, and close with a prioritized "Top 3 actions to improve your score" section
