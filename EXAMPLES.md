# Worked Examples

Each example shows the failure mode (section in `CLAUDE.md`, or "notes" for
[Claude Code notes](docs/CLAUDE_CODE_NOTES.md)), the lazy/wrong agent
behavior, and the disciplined behavior. Code is
illustrative; the lesson is in the contrast.

---

## 1. Hidden assumption in a vague request (§1)

**Prompt:** "Add rate limiting to the API."

**Wrong:**

```python
# agent silently invents: 100 req/min, per IP, sliding window, in-memory
from collections import defaultdict
import time

_buckets = defaultdict(list)

def rate_limit(ip: str) -> bool:
    now = time.time()
    _buckets[ip] = [t for t in _buckets[ip] if now - t < 60]
    if len(_buckets[ip]) >= 100:
        return False
    _buckets[ip].append(now)
    return True
```

This bakes in five decisions the user never made: 100/min, per IP, sliding
window, in-process state, fail-closed. Behind a load balancer the IP key
is wrong; in a multi-worker deploy the in-process state is wrong.

**Right:**

> Before I implement this, I need to confirm four things:
> 1. Per IP, per API key, or per user ID?
> 2. What limit (e.g., 100/min)? And what window — fixed, sliding, token bucket?
> 3. Single process, or shared across workers (Redis-backed)?
> 4. On limit hit: 429 with `Retry-After`, or queue?
>
> Default I'd pick if you say "just do something reasonable": per API
> key, 60 req/min token bucket, Redis-backed if you have Redis configured
> (I see `REDIS_URL` in `.env.example`), 429 + `Retry-After`. OK to
> proceed with that?

---

## 2. Premature abstraction on the first feature (§2)

**Prompt:** "Add a CSV export of orders."

**Wrong:**

```typescript
interface Exporter<T> {
  format(): string;
  serialize(rows: T[]): string;
}

class CsvExporter<T> implements Exporter<T> { /* ... */ }
class JsonExporter<T> implements Exporter<T> { /* ... */ }   // not requested
class XmlExporter<T> implements Exporter<T> { /* ... */ }    // not requested

class ExporterFactory {
  static create<T>(format: string): Exporter<T> { /* ... */ }
}
```

Three formats, a factory, and a generic interface for one concrete need.

**Right:**

```typescript
// src/orders/export.ts
import { stringify } from 'csv-stringify/sync';
import type { Order } from './types';

export function ordersToCsv(orders: Order[]): string {
  return stringify(orders, {
    header: true,
    columns: ['id', 'customer_email', 'total_cents', 'created_at'],
  });
}
```

When JSON export is requested, write `ordersToJson`. If a third format
shows up, *then* extract the shared shape — driven by real duplication,
not anticipated symmetry.

---

## 3. Drive-by reformat (§3)

**Prompt:** "Fix the off-by-one in `paginate()`."

**Wrong diff:**

```diff
-def paginate(items, page, per_page):
-    start = page * per_page
-    end   = start + per_page
-    return items[start:end]
+def paginate(items: list, page: int, per_page: int) -> list:
+    """Return a single page of items (1-indexed)."""
+    if page < 1:
+        raise ValueError("page must be >= 1")
+    start = (page - 1) * per_page
+    end = start + per_page
+    return items[start:end]
```

The off-by-one is fixed, but the diff also adds type hints, a docstring,
input validation, and reformats whitespace. The reviewer now has to
think about four things instead of one.

**Right diff:**

```diff
 def paginate(items, page, per_page):
-    start = page * per_page
+    start = (page - 1) * per_page
     end   = start + per_page
     return items[start:end]
```

If type hints and validation are valuable, raise them as a follow-up.
Don't smuggle them into a bug fix.

---

## 4. "It should work" — no verification (§4)

**Prompt:** "Convert the `users` query to use the new `db.exec()` helper."

**Wrong:**

> Done. I replaced the raw `cursor.execute()` calls with `db.exec()` in
> `users.py`. The behavior should be equivalent.

There is no evidence anything was checked.

**Right:**

> Replaced both `cursor.execute()` sites in `users.py` with `db.exec()`.
> Verification:
>
> ```
> $ pytest tests/test_users.py -q
> ........                                                          [100%]
> 8 passed in 0.41s
>
> $ ruff check users.py
> All checks passed!
> ```
>
> One thing to flag: `db.exec()` raises `DBError` where the old code
> raised `sqlite3.OperationalError`. The two existing call sites in
> `routes/admin.py` catch `Exception`, so they keep working, but if you
> have logging or alerting that filters on the old type, that will break.

---

## 5. Reading the world to find one symbol (§5)

**Prompt:** "Where is `compute_invoice_total` defined?"

**Wrong:** call `Read` on `src/billing.py` (1,800 lines), then on
`src/invoices.py` (900 lines), then on `src/utils.py` (600 lines),
because "billing" sounds related.

**Right:**

```
Grep "def compute_invoice_total" --type py
```

One call. Returns `src/billing/totals.py:42`. Now `Read` lines 30–80 of
that file. Three thousand tokens saved.

---

## 6. Sequential tool calls that should be parallel (§5)

**Prompt:** "Summarize the routes, the schema, and the test config."

**Wrong:** Read `routes.py`, wait, read `schema.sql`, wait, read
`pytest.ini`, wait, then summarize. Three sequential round trips.

**Right:** Issue all three reads in a single batched tool-use turn. The
files don't depend on each other; there is no reason to serialize.

---

## 7. MCP server bloat (notes)

**Wrong:** Connect MCP servers for GitHub, GitLab, Jira, Linear,
Notion, Confluence, Slack, Discord, PagerDuty, Datadog, Sentry, AWS,
GCP, Azure, Stripe — "in case I need them." Every turn now ships ~80
tool definitions in the system prompt. The agent occasionally invokes
the wrong issue tracker.

**Right:** Connect what you actually use this week. For most repos
that's one issue tracker, one observability tool, and the cloud
provider you deploy to. When you need Stripe for an afternoon, enable
it for the afternoon and disable it after.

---

## 8. Subagent for a one-shot task (§5)

**Prompt:** "What's the version of `requests` we use?"

**Wrong:** Spawn a `general-purpose` subagent with instructions to
"investigate the dependency management setup and report back." The
subagent reads `pyproject.toml`, `poetry.lock`, `requirements.txt`,
and `setup.cfg`, then returns a 400-word summary.

**Right:**

```
Grep "^requests" requirements.txt
```

or

```
Grep "\"requests\"" pyproject.toml
```

One tool call. Delegation has overhead; pay it when the task justifies
it.

---

## 9. Subagent that should have been used (§5)

**Prompt:** "I just finished the auth refactor. Review it for security
issues."

**Wrong:** The same agent that just spent an hour writing the refactor
now reviews it. It has a sunk-cost view of every decision. It rates its
own work as fine.

**Right:**

> I'll dispatch a fresh review subagent with read-only access. It will
> not see the prior conversation. I'll ask it to look specifically for:
> token handling, session fixation, CSRF on the new endpoints, and
> error messages that leak existence of accounts. Findings will come
> back as a single summary.

The independence is the point.

---

## 10. Skill misuse: too generic (notes)

**Wrong `SKILL.md`:**

```yaml
---
name: helpful-coder
description: Use this skill to write good code.
---
```

This will either fire on every prompt (defeating the purpose of skills
loading on demand) or fire on none (because the description matches
nothing specific). Either way, the activation gate is broken.

**Right `SKILL.md`:**

```yaml
---
name: alembic-migration-author
description: |
  Author and review Alembic database migrations for the billing service.
  Use whenever the user asks to add, modify, or roll back a database
  schema change in services/billing, mentions a new column or table,
  or pastes an alembic revision file. Covers the project's conventions
  for online vs. offline DDL, backfill scripts, and zero-downtime
  deploys.
---
```

Specific trigger conditions, named subsystem, lists the kinds of
prompts that should activate it. The body of the skill can then be
long without paying for it on every turn.

---

## 11. Plan mode skipped on a multi-file refactor (§5)

**Prompt:** "Move the email-sending code out of `users.py` into a
separate `notifications/` package."

**Wrong:** start editing immediately. Create `notifications/email.py`.
Delete from `users.py`. Realize on file 4 that the test fixtures import
from `users.email_*`. Realize on file 6 that a Celery task references
the old path by string. Half-broken commit.

**Right:** `Shift+Tab Shift+Tab` to enter plan mode. Plan-mode agent
reads `users.py`, greps for `users.email`, finds 11 call sites
including two string references in Celery configuration. Produces a
plan: create new module, add re-export shim in `users.py` for
backward compatibility, migrate call sites in three commits, remove
shim. User approves. Then execute.

---

## 12. Wrong model for the work (notes)

**Wrong:** Run Opus on "rename `total` to `total_cents` in `Invoice`."
A two-line `Edit` and a test re-run. Opus is 5× the price of Sonnet
for output and ~3× of Haiku, with no quality difference on a rename.

**Wrong (other direction):** Run Haiku on "design and implement a new
event-sourcing layer for the orders service." Haiku is fast and cheap
but is not the right model for cross-cutting architecture work.

**Right:** Haiku (or whatever the local equivalent is) for the rename.
Sonnet for the bulk of day-to-day coding. Opus when you have evidence
it does measurably better on the specific task — typically large
refactors, multi-step planning, or genuinely novel design.

---

## 13. Public method removed as dead code (§3)

**Prompt:** "Remove the dead code from src/."

**Wrong:** The agent searches the repo, finds no caller for
`Cart.summary()`, and deletes it along with an unused debug helper. Tests
and the build still pass. The README says the package is a library used by
another service, so the method can have callers the repo cannot show. In
the [evals](evals/README.md), Codex did this in 3 of 5 runs with v1.2 of
these rules, and never without a rules file.

**Right:** Search, then sort what you found. Remove private code with no
callers. List exported or public code and ask:

```text
No callers in this repo: debugDump (src/util.js) and Cart.summary().
Both are exported from a library, so other code may use them.
Remove both, or only debugDump?
```
