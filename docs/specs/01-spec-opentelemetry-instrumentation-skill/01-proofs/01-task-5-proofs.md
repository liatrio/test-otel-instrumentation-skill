# Task 5.0 Proof Artifacts — Instrumentation Scoring Workflow (Unit 3)

## SKILL.md Sections Added

- `## Score Mode` at line 137 in SKILL.md ✓
- `### Score Mode Output Format` at line 166 in SKILL.md ✓

## Score Mode Steps Verification

The Score Mode section in SKILL.md implements all 6 required steps:

| Step | Requirement | Implemented |
|---|---|---|
| 1 | Identify language | ✓ "Determine the language from the code" |
| 2 | Load all rules from instrumentation-score.md | ✓ "Open `references/instrumentation-score.md`. Read the full rules list" |
| 3 | Evaluate by target (Resource → Span → Metric → Log → SDK) | ✓ "Work through the rules grouped by Target in this order" |
| 4 | Record Rule ID, offending lines, concrete fix | ✓ Per-violation format: rule ID → current code → fix code |
| 5 | Per-category pass/fail score | ✓ Category breakdown table in output format |
| 6 | Overall weighted score | ✓ Weighted formula from instrumentation-score.md applied |

## Output Format Verification

| Element | Requirement | Implemented |
|---|---|---|
| Overall score + verdict | "62% — needs work on…" | ✓ "Score: 63% — Needs Improvement (primary issues: ...)" |
| Category breakdown table | Category, Passed, Failed, Score columns | ✓ Table format defined |
| Findings sorted by Impact | Critical first | ✓ "sorted Critical → Important → Normal → Low" |
| Per-finding format | Rule ID + Current + Fix code blocks | ✓ `**[RULE-ID] — [Impact]**` + fenced Current + Fix |
| Top 3 actions | Specific, actionable | ✓ "Top 3 actions" section with file location + change + score impact |

## Demo: Python Service with Bad Instrumentation

**Input:**
```python
import time
from opentelemetry import trace

tracer = trace.get_tracer(__name__)

def process_payment(user_id, amount):
    # span name contains high-cardinality user ID
    with tracer.start_as_current_span(f"process-payment-{user_id}") as span:
        try:
            result = charge_card(user_id, amount)
            return result
        except Exception as e:
            # error not recorded properly
            span.set_attribute("error", str(e))
            raise
```

**Expected score output:**

```
Score: 45% — Poor (primary issues: span naming cardinality, missing error recording, no service.name resource)

| Category | Rules Evaluated | Passed | Failed | Score |
|---|---|---|---|---|
| Resource | 2 | 0 | 2 | 0% |
| Span | 3 | 1 | 2 | 40% |

**[RES-005] — Critical**: `service.name` resource attribute is not configured — SDK will default to `unknown_service`

Current:
tracer = trace.get_tracer(__name__)  # no resource configured

Fix:
resource = Resource.create({SERVICE_NAME: "payment-service", ...})
provider = TracerProvider(resource=resource)

**[SPA-003] — Important**: Span name `process-payment-{user_id}` contains high-cardinality user ID

Current:
with tracer.start_as_current_span(f"process-payment-{user_id}"):

Fix:
with tracer.start_as_current_span("process payment"):
    span.set_attribute("app.user.id", user_id)  # put ID in attribute, not span name

**[SPA error recording] — Important**: Exception caught but not recorded using OTel error protocol

Current:
span.set_attribute("error", str(e))

Fix:
span.record_exception(e)
span.set_status(StatusCode.ERROR, "payment processing failed")
span.set_attributes({"error.type": type(e).__name__})

Top 3 actions:
1. Configure service.name resource (+Critical weight, biggest score impact)
2. Fix span name to remove user_id (+Important weight)  
3. Replace span.set_attribute("error", ...) with record_exception + setStatus + error.type (+Important weight)
```

**Rule IDs cited in output:** RES-005 (Critical), SPA-003 (Important) — sourced from `references/instrumentation-score.md` ✓
